# Media & File Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add file upload to the editor so users can attach media (images/video) and files to memos, stored in Cloudflare R2.

**Architecture:** Alchemy provisions an R2 bucket and binds it to the Worker as `ATTACHMENTS_BUCKET`. The editor's create memo server function accepts JSON with files encoded as base64, uploads each file to R2 with key `uploads/{memoId}/{uuid}-{filename}`, and inserts attachment records in the `attachment` table. The editor UI adds file picker, pending file state, and an attachment area below the editor. Attachments are joined in the memo list query.

**Tech Stack:** Cloudflare Workers + R2, TanStack Start server functions, Drizzle ORM, Lexical editor, lucide-react icons

---

### File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/infra/alchemy.run.ts` | Modify | Add `R2Bucket` binding named `ATTACHMENTS_BUCKET` |
| `apps/web/src/features/editor/functions/create-memo.function.ts` | Modify | Accept files as base64 JSON, upload to R2, create attachment records |
| `apps/web/src/features/editor/components/editor.tsx` | Modify | Add pending file state, file pickers, attachment area UI, FormData save |
| `apps/web/src/features/editor/functions/list-memos.function.ts` | Modify | Include attachment data in memo response |
| `apps/web/src/features/editor/queries/memos.query.ts` | Modify | Update type to include attachments |
| `apps/web/src/features/editor/components/memo-list.tsx` | Modify | Display attachments below memo content |

---

### Task 1: Provision R2 bucket and bind to Worker

**Files:**
- Modify: `packages/infra/alchemy.run.ts`

- [ ] **Step 1: Add R2Bucket import and creation**

  At the top of `packages/infra/alchemy.run.ts`, add the import:

  ```ts
  import { R2Bucket } from "alchemy/cloudflare";
  ```

  After the `app` definition, create the bucket:

  ```ts
  const bucket = await R2Bucket("attachments", {
    empty: true,
  });
  ```

  Then add `ATTACHMENTS_BUCKET` to the `TanStackStart` bindings:

  ```ts
  export const web = await TanStackStart("web", {
    cwd: "../../apps/web",
    bindings: {
      DATABASE_URL: alchemy.secret.env.DATABASE_URL!,
      CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
      BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
      BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
      ATTACHMENTS_BUCKET: bucket,
    },
  });
  ```

- [ ] **Step 2: Verify**

  Run: `bun run check-types` (or `turbo check-types`)
  Expected: No type errors. The `Env` type should auto-generate `ATTACHMENTS_BUCKET: R2Bucket`.

---

### Task 2: Modify create memo server function to accept files

Files are sent as base64 strings inside the JSON payload (since `createServerFn` is JSON-based).

**Files:**
- Modify: `apps/web/src/features/editor/functions/create-memo.function.ts`

- [ ] **Step 1: Add file interface and update input validator**

  ```ts
  export interface FilePayload {
    name: string;
    type: string;
    size: number;
    base64: string;
  }

  interface CreateMemoInput {
    content: string;
    payload: Record<string, unknown>;
    visibility: string;
    tags?: string[];
    files?: FilePayload[];
  }
  ```

  Update `inputValidator`:

  ```ts
  .inputValidator((input: unknown) => {
    const { content, payload, visibility, tags, files } = input as CreateMemoInput;

    if (!content?.trim()) {
      throw new Error("Content is required");
    }

    if (
      payload !== undefined &&
      (typeof payload !== "object" ||
        payload === null ||
        Array.isArray(payload))
    ) {
      throw new Error("Payload must be a plain object");
    }

    return { content, payload, visibility, tags, files: files ?? [] };
  })
  ```

- [ ] **Step 2: Update handler to upload files to R2**

  After creating the memo record, add file upload logic. Import `{ env }` from `@memos/env/server`.

  Key section to add (after the `[created] = await db.insert(...).returning()` block):

  ```ts
  // Upload files to R2 and create attachment records
  const bucket = env.ATTACHMENTS_BUCKET;
  const createdAttachments = [];

  for (const file of data.files) {
    const key = `uploads/${created.id}/${crypto.randomUUID()}-${file.name}`;
    const binaryStr = atob(file.base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    try {
      await bucket.put(key, bytes.buffer, {
        httpMetadata: { contentType: file.type },
      });
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      continue;
    }

    const [att] = await db
      .insert(attachment)
      .values({
        uid: crypto.randomUUID(),
        creatorId: session.user.id,
        memoId: created.id,
        filename: file.name,
        type: file.type,
        size: file.size,
        storageType: "R2",
        reference: key,
      })
      .returning();

    createdAttachments.push({
      id: att.id,
      uid: att.uid,
      filename: att.filename,
      type: att.type,
      size: att.size,
      storageType: att.storageType,
      reference: att.reference,
    });
  }
  ```

  Add `createdAttachments` to the return object. Also add these dynamic imports at the top of the handler:

  ```ts
  const [{ attachment }, { env }] = await Promise.all([
    import("@memos/db/schema/attachment.table"),
    import("@memos/env/server"),
  ]);
  ```

- [ ] **Step 3: Update the `onSave` type in editor.tsx**

  Change from detailed payload type to accept the raw form:

  ```ts
  onSave?: (data: {
    content: string;
    payload: Record<string, unknown>;
    visibility: string;
    tags?: string[];
    files?: Array<{ name: string; type: string; size: number; base64: string }>;
  }) => void;
  ```

---

### Task 3: Add file selection and attachment UI to editor

**Files:**
- Modify: `apps/web/src/features/editor/components/editor.tsx`

- [ ] **Step 1: Add pending files state and helper functions**

  After existing state declarations, add:

  ```ts
  import { useRef } from "react";
  import { FileIcon, ImageIcon, XIcon } from "lucide-react";
  ```

  Add at the state section:

  ```ts
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  ```

  Add the `PendingFile` type at the top of the component (or in a nearby interfaces area):

  ```ts
  interface PendingFile {
    id: string;
    file: File;
  }
  ```

  Add a helper to add files and format size:

  ```ts
  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  ```

- [ ] **Step 2: Add hidden file inputs**

  After the LexicalComposer div (before the toolbar div), add hidden file inputs:

  ```tsx
  <input
    ref={mediaInputRef}
    type="file"
    accept="image/*,video/*"
    multiple
    className="hidden"
    onChange={(e) => {
      const files = Array.from(e.target.files ?? []).map((f) => ({
        id: crypto.randomUUID(),
        file: f,
      }));
      setPendingFiles((prev) => [...prev, ...files]);
      e.target.value = ""; // reset so same file can be picked again
    }}
  />
  <input
    ref={fileInputRef}
    type="file"
    multiple
    className="hidden"
    onChange={(e) => {
      const files = Array.from(e.target.files ?? []).map((f) => ({
        id: crypto.randomUUID(),
        file: f,
      }));
      setPendingFiles((prev) => [...prev, ...files]);
      e.target.value = "";
    }}
  />
  ```

- [ ] **Step 3: Wire Media and File dropdown items to triggers**

  Replace the DropdownMenuItem contents:

  ```tsx
  <DropdownMenuItem onClick={() => mediaInputRef.current?.click()}>
    <ImageIcon className="size-4" />
    Media
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
    <FileIcon className="size-4" />
    File
  </DropdownMenuItem>
  ```

- [ ] **Step 4: Add attachment area below editor content**

  Before the toolbar row div, add:

  ```tsx
  {pendingFiles.length > 0 && (
    <div className="border-t px-3.5 py-2 space-y-1">
      {pendingFiles.map((pf) => (
        <div
          key={pf.id}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          {pf.file.type.startsWith("image/") || pf.file.type.startsWith("video/")
            ? <ImageIcon className="size-3.5 shrink-0" />
            : <FileIcon className="size-3.5 shrink-0" />}
          <span className="truncate">{pf.file.name}</span>
          <span className="shrink-0">{formatSize(pf.file.size)}</span>
          <button
            type="button"
            className="ml-auto shrink-0 hover:text-foreground"
            onClick={() =>
              setPendingFiles((prev) => prev.filter((p) => p.id !== pf.id))
            }
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )}
  ```

- [ ] **Step 5: Add base64 conversion helper and update save handler**

  Add a helper to convert File to base64:

  ```tsx
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // strip data:...;base64 prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  ```

  Modify `handleSave` to send files as base64 in the JSON payload:

  ```tsx
  const handleSave = useCallback(async () => {
    const state = editorStateRef.current;
    if (!state || isSaving) return;

    let content = "";
    state.read(() => {
      content = $getRoot().getTextContent().trim();
    });

    if (!content) return;

    const tags = Array.from(content.matchAll(/#([\w\u4e00-\u9fff]+)/g)).map(
      (m) => m[1],
    );

    const files = await Promise.all(
      pendingFiles.map(async (pf) => ({
        name: pf.file.name,
        type: pf.file.type,
        size: pf.file.size,
        base64: await fileToBase64(pf.file),
      })),
    );

    onSave?.({
      content,
      payload: state.toJSON() as unknown as Record<string, unknown>,
      visibility,
      tags,
      files,
    });
  }, [onSave, visibility, isSaving, pendingFiles]);
  ```

- [ ] **Step 6: Update `onSave` type**

  In the `Editor` component props, extend the `onSave` type:

  ```tsx
  interface FilePayload {
    name: string;
    type: string;
    size: number;
    base64: string;
  }

  function Editor({
    onSave,
    isSaving,
  }: {
    onSave?: (data: {
      content: string;
      payload: Record<string, unknown>;
      visibility: string;
      tags?: string[];
      files?: FilePayload[];
    }) => void;
    isSaving?: boolean;
  }) {

---

### Task 4: Include attachments in memo list

**Files:**
- Modify: `apps/web/src/features/editor/functions/list-memos.function.ts`
- Modify: `apps/web/src/features/editor/queries/memos.query.ts` (types only)

- [ ] **Step 1: Left join attachments in list function**

  In `list-memos.function.ts`, add `attachment` to the import and left join it:

  ```ts
  const [{ attachment }] = await Promise.all([
    import("@memos/db/schema/attachment.table"),
    // ... existing imports
  ]);

  const memos = await db
    .select()
    .from(memo)
    .leftJoin(attachment, eq(attachment.memoId, memo.id))
    .where(and(...conditions))
    .orderBy(desc(memo.createdAt))
    .limit(20);
  ```

  Then group attachments by memo:

  ```ts
  const memoMap = new Map<number, typeof memo.$inferSelect & { attachments: typeof attachment.$inferSelect[] }>();
  for (const row of memos) {
    if (!memoMap.has(row.memo.id)) {
      memoMap.set(row.memo.id, { ...row.memo, attachments: [] });
    }
    if (row.attachment) {
      memoMap.get(row.memo.id)!.attachments.push(row.attachment);
    }
  }
  ```

  Return type includes attachments:

  ```ts
  return Array.from(memoMap.values()).map((m) => ({
    id: m.id,
    uid: m.uid,
    content: m.content,
    payload: m.payload,
    visibility: m.visibility,
    tags: m.tags,
    createdAt: m.createdAt.toISOString(),
    attachments: m.attachments.map((a) => ({
      id: a.id,
      uid: a.uid,
      filename: a.filename,
      type: a.type,
      size: a.size,
      storageType: a.storageType,
      reference: a.reference,
    })),
  }));
  ```

- [ ] **Step 2: Update type in query options**

  The `Memo` type from `listMemosFn` already includes `attachments` now. No separate type update needed.

---

### Task 5: Display attachments in memo list

**Files:**
- Modify: `apps/web/src/features/editor/components/memo-list.tsx`

- [ ] **Step 1: Add attachment section to each memo card**

  After the content paragraph and before the metadata row, add:

  ```tsx
  {memo.attachments && memo.attachments.length > 0 && (
    <div className="mt-2 space-y-1">
      {memo.attachments.map((att) => (
        <div
          key={att.uid}
          className="flex items-center gap-2 rounded bg-muted/50 px-2 py-1 text-xs"
        >
          {att.type.startsWith("image/") || att.type.startsWith("video/")
            ? <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
            : <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />}
          <span className="truncate text-muted-foreground">{att.filename}</span>
        </div>
      ))}
    </div>
  )}
  ```

  Add missing imports at the top:

  ```tsx
  import { FileIcon, ImageIcon } from "lucide-react";
  ```

---

### Task 6: Add R2 file proxy API route

The `reference` field stores the R2 key (e.g., `uploads/123/uuid-filename.png`). Add an API route to serve files through the Worker, using the same pattern as `routes/api/auth/$.ts`:

- Create: `apps/web/src/routes/api/files/$.ts`

  ```ts
  import { createFileRoute } from "@tanstack/react-router";

  export const Route = createFileRoute("/api/files/$")({
    server: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key");
        if (!key) return new Response("Missing key", { status: 400 });

        const { env } = await import("@memos/env/server");
        const object = await env.ATTACHMENTS_BUCKET.get(key);
        if (!object) return new Response("Not found", { status: 404 });

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("Cache-Control", "public, max-age=31536000");
        return new Response(object.body, { headers });
      },
    },
  });
  ```

  This allows memos to reference attachments as `/api/files?key=uploads/123/uuid-file.png`.
