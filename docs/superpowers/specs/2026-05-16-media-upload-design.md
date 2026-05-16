# Media & File Upload Design

## Overview

Add media/file upload support to the editor. Users select files from the "+" dropdown (Media or File), see pending attachments below the editor, and upload everything together when saving the memo.

## Infrastructure

```ts
// packages/infra/alchemy.run.ts
import { R2Bucket } from "alchemy/cloudflare";

const bucket = await R2Bucket("attachments", { empty: true });

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

`ATTACHMENTS_BUCKET` will be available as `env.ATTACHMENTS_BUCKET` (Cloudflare R2Bucket type) in the Worker.

## Client: Editor Component

### File Selection

| Trigger | Accept Filter |
|---------|---------------|
| Media   | `image/*,video/*` |
| File    | `*/*` |

Both support multiple file selection.

### State

```ts
interface PendingFile {
  id: string;       // unique key for React
  file: File;       // original File object
  previewUrl?: string; // object URL for image preview
}
```

`pendingFiles: PendingFile[]` — files selected but not yet uploaded.

### Attachment Area

Rendered below the Lexical editor, above the toolbar row. Each item shows:
- File icon (ImageIcon for media, FileIcon for file)
- Filename
- Formatted size (KB/MB)
- Remove button (×)

### Save Flow

On save, construct a `FormData` containing:
- `content` — memo text
- `payload` — JSON.stringify(editor state)
- `visibility` — visibility string
- `tags` — JSON.stringify(tags[])
- `files` — append each File with key `files`

Submit via `createMemoFn` (modified to accept FormData).

## Server: createMemoFn

1. Parse FormData
2. Extract memo fields (content, payload, visibility, tags)
3. INSERT into `memos` table → get memoId
4. For each file in `files`:
   - Generate key: `uploads/{memoId}/{uuid}-{filename}`
   - `env.ATTACHMENTS_BUCKET.put(key, file)`
   - INSERT into `attachments` table (memoId, filename, type, size, storageType="R2", reference=key, creatorId)
5. Return `{ memo, attachments }`

### R2 Key Format

```
uploads/{memoId}/{random-uuid}-{sanitized-filename}
```

### Attachment Table Schema

Already exists in `packages/db/src/schema/attachment.table.ts`:
- `id`, `uid`, `creatorId`, `filename`, `type`, `size`, `externalUrl`, `memoId`, `storageType`, `reference`, `payload`

For R2 uploads:
- `storageType` = `R2`
- `reference` = R2 object key (e.g., `uploads/{memoId}/{uuid}-{filename}`)
- `externalUrl` = generated public URL if bucket allows public access, or use Workers proxy

## Display: Memo List

When rendering a memo that has attachments, show them below the memo content as download links. Use the existing `LexicalRenderer` + new attachment section.

## Files to Create/Modify

| File | Action |
|------|--------|
| `packages/infra/alchemy.run.ts` | Add R2Bucket binding |
| `apps/web/src/features/editor/components/editor.tsx` | Add pendingFiles state, file picker, attachment area, FormData save |
| `apps/web/src/features/editor/functions/create-memo.function.ts` | Accept FormData, handle file upload to R2, create attachment records |
| `apps/web/src/features/editor/components/memo-list.tsx` | Display attachments below memo content |
| `apps/web/src/features/editor/queries/memos.query.ts` | Update query to include attachments |
| `apps/web/src/features/memos/functions/list-memos.function.ts` | (if needed) Join attachments in memo list |

## Error Handling

- File size limit: 50MB per file (R2 limit)
- On save failure, attachments are not persisted (files not uploaded, memo not created)
- Pending files remain in state so user can retry
