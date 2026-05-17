# Reactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add emoji reactions to memo cards with hover-triggered emoji picker and aggregated display.

**Architecture:** Server functions (TanStack Start) for toggle/list reactions. React Query for caching. Frimousse EmojiPicker inside a base-ui Popover. Reactions are per-memo, toggled by unique (creatorId, contentId, reactionType).

**Tech Stack:** TanStack Start (server functions), React Query, Drizzle ORM, base-ui (Popover), Frimousse (EmojiPicker), shadcn/ui (tailwind)

---

### Task 1: Server function — toggleReactionFn

**Files:**
- Create: `apps/web/src/features/memos/functions/toggle-reaction.function.ts`

- [ ] **Step 1: Write the function**

```ts
import { createServerFn } from "@tanstack/react-start";

export const toggleReactionFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = input as { contentId: string; reactionType: string };
    if (!data.contentId || !data.reactionType) {
      throw new Error("contentId and reactionType are required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const [
      { createDb },
      { reaction },
      { createAuth },
      { getRequestHeaders },
      { eq, and },
    ] = await Promise.all([
      import("@memos/db"),
      import("@memos/db/schema/reaction.table"),
      import("@memos/auth"),
      import("@tanstack/react-start/server"),
      import("drizzle-orm"),
    ]);

    const headers = getRequestHeaders();
    const session = await createAuth().api.getSession({ headers });
    if (!session) {
      throw new Error("Not authenticated");
    }

    const db = createDb();

    const existing = await db
      .select()
      .from(reaction)
      .where(
        and(
          eq(reaction.creatorId, session.user.id),
          eq(reaction.contentId, data.contentId),
          eq(reaction.reactionType, data.reactionType),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(reaction)
        .where(
          and(
            eq(reaction.creatorId, session.user.id),
            eq(reaction.contentId, data.contentId),
            eq(reaction.reactionType, data.reactionType),
          ),
        );
      return { action: "removed" as const };
    }

    await db.insert(reaction).values({
      creatorId: session.user.id,
      contentId: data.contentId,
      reactionType: data.reactionType,
    });

    return { action: "added" as const };
  });
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/memos/functions/toggle-reaction.function.ts
git commit -m "feat: add toggle-reaction server function"
```

---

### Task 2: Server function — listReactionsFn

**Files:**
- Create: `apps/web/src/features/memos/functions/list-reactions.function.ts`

- [ ] **Step 1: Write the function**

```ts
import { createServerFn } from "@tanstack/react-start";

export interface ReactionUser {
  id: number;
  creatorId: string;
  creatorName: string;
  reactionType: string;
}

export const listReactionsFn = createServerFn({ method: "GET" })
  .validator((input: unknown) => {
    const data = input as { contentId: string };
    if (!data.contentId) {
      throw new Error("contentId is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const [
      { createDb },
      { reaction },
      { user },
      { createAuth },
      { getRequestHeaders },
      { eq },
    ] = await Promise.all([
      import("@memos/db"),
      import("@memos/db/schema/reaction.table"),
      import("@memos/db/schema/auth.table"),
      import("@memos/auth"),
      import("@tanstack/react-start/server"),
      import("drizzle-orm"),
    ]);

    const headers = getRequestHeaders();
    const session = await createAuth().api.getSession({ headers });
    if (!session) {
      return [];
    }

    const db = createDb();

    const rows = await db
      .select({
        id: reaction.id,
        reactionType: reaction.reactionType,
        creatorId: reaction.creatorId,
        creatorName: user.name,
        createdAt: reaction.createdAt,
      })
      .from(reaction)
      .innerJoin(user, eq(user.id, reaction.creatorId))
      .where(eq(reaction.contentId, data.contentId))
      .orderBy(reaction.createdAt);

    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  });
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/memos/functions/list-reactions.function.ts
git commit -m "feat: add list-reactions server function"
```

---

### Task 3: React Query hooks

**Files:**
- Create: `apps/web/src/features/memos/queries/reactions.query.ts`

- [ ] **Step 1: Write the query options**

```ts
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listReactionsFn,
  type ReactionUser,
} from "../functions/list-reactions.function";
import { toggleReactionFn } from "../functions/toggle-reaction.function";

export const reactionsQueryOptions = (contentId: string) =>
  queryOptions({
    queryKey: ["reactions", contentId],
    queryFn: () => listReactionsFn({ contentId } as never),
  });

export function useToggleReaction(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleReactionFn,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions", contentId] });
    },
  });
}

export type { ReactionUser };
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/memos/queries/reactions.query.ts
git commit -m "feat: add reactions query hooks"
```

---

### Task 4: ReactionBadge component

**Files:**
- Create: `apps/web/src/features/memos/components/reaction-badge.tsx`

- [ ] **Step 1: Write the component**

```tsx
import type { ReactionUser } from "../queries/reactions.query";

interface ReactionBadgeProps {
  emoji: string;
  users: ReactionUser[];
  currentUserId?: string;
  onToggle: (emoji: string) => void;
}

function formatReactionText(users: ReactionUser[]): string {
  if (users.length === 1) {
    return `${users[0].creatorName} reacted with `;
  }
  if (users.length === 2) {
    return `${users[0].creatorName} and ${users[1].creatorName} reacted with `;
  }
  if (users.length === 3) {
    return `${users[0].creatorName}, ${users[1].creatorName} and ${users[2].creatorName} reacted with `;
  }
  return `${users[0].creatorName}, ${users[1].creatorName}, ${users[2].creatorName} and ${users.length - 3} more reacted with `;
}

function ReactionBadge({
  emoji,
  users,
  currentUserId,
  onToggle,
}: ReactionBadgeProps) {
  const hasReacted = users.some((u) => u.creatorId === currentUserId);

  return (
    <button
      type="button"
      onClick={() => onToggle(emoji)}
      data-active={hasReacted || undefined}
      className="group flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs transition-colors hover:bg-accent data-[active]:bg-accent data-[active]:border-primary/30"
      title={users.map((u) => u.creatorName).join(", ")}
    >
      <span className="text-sm">{emoji}</span>
      <span className="text-muted-foreground group-hover:text-foreground">
        {formatReactionText(users)}
        {emoji}
      </span>
    </button>
  );
}

export { ReactionBadge };
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/memos/components/reaction-badge.tsx
git commit -m "feat: add ReactionBadge component"
```

---

### Task 5: MemoReactions component

**Files:**
- Create: `apps/web/src/features/memos/components/memo-reactions.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { Popover } from "@base-ui/react/popover";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@memos/ui/components/emoji-picker";
import { SmilePlusIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ReactionBadge } from "./reaction-badge";
import {
  reactionsQueryOptions,
  useToggleReaction,
  type ReactionUser,
} from "../queries/reactions.query";

function groupReactions(
  reactions: ReactionUser[],
): Map<string, ReactionUser[]> {
  const grouped = new Map<string, ReactionUser[]>();
  for (const r of reactions) {
    const existing = grouped.get(r.reactionType) ?? [];
    existing.push(r);
    grouped.set(r.reactionType, existing);
  }
  return grouped;
}

interface MemoReactionsProps {
  contentId: string;
  currentUserId?: string;
}

function MemoReactions({ contentId, currentUserId }: MemoReactionsProps) {
  const { data: reactions = [] } = useQuery(
    reactionsQueryOptions(contentId),
  );
  const toggleMutation = useToggleReaction(contentId);

  const grouped = groupReactions(reactions);
  const [open, setOpen] = useState(false);

  const handleToggle = (emoji: string) => {
    toggleMutation.mutate({ contentId, reactionType: emoji } as never);
  };

  const hasReactions = reactions.length > 0;

  if (!currentUserId && !hasReactions) {
    return null;
  }

  return (
    <div className="mt-2 flex items-center gap-1.5">
      {hasReactions && (
        <div className="flex flex-wrap gap-1">
          {Array.from(grouped.entries()).map(([emoji, users]) => (
            <ReactionBadge
              key={emoji}
              emoji={emoji}
              users={users}
              currentUserId={currentUserId}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
      {currentUserId && (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger
            className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity group-hover/memo:opacity-100 hover:bg-accent hover:text-foreground"
            aria-label="Add reaction"
          >
            <SmilePlusIcon className="size-4" />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="top" align="end" sideOffset={4}>
              <Popover.Popup className="z-50 h-80 w-72 overflow-hidden rounded-lg bg-popover shadow-lg ring-1 ring-foreground/10">
                <EmojiPicker
                  onEmojiSelect={({ emoji }) => {
                    handleToggle(emoji);
                    setOpen(false);
                  }}
                  locale="zh"
                >
                  <EmojiPickerSearch />
                  <EmojiPickerContent />
                  <EmojiPickerFooter />
                </EmojiPicker>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
}

export { MemoReactions };
```

- [ ] **Step 2: Verify TypeScript**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/memos/components/memo-reactions.tsx
git commit -m "feat: add MemoReactions component with emoji picker popover"
```

---

### Task 6: Migrate memo-list to features/memos/components/

**Files:**
- Copy: `apps/web/src/features/editor/components/memo-list.tsx` → `apps/web/src/features/memos/components/memo-list.tsx`
- Delete: `apps/web/src/features/editor/components/memo-list.tsx`
- Modify: `apps/web/src/routes/_memos/_protected/home.tsx`

- [ ] **Step 1: Copy memo-list.tsx to new location and add MemoReactions integration**

Read the current file at `apps/web/src/features/editor/components/memo-list.tsx`, then create `apps/web/src/features/memos/components/memo-list.tsx` with the MemoReactions component integrated into each memo card:

```tsx
import { getSessionFn } from "@/functions/get-session";
import { Temporal } from "@js-temporal/polyfill";
import { Skeleton } from "@memos/ui/components/skeleton";
import { FileIcon, ImageIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { listMemosFn } from "../functions/list-memos.function";
import { MemoReactions } from "./memo-reactions";
import { LexicalRenderer } from "../../editor/components/lexical-renderer";

type Memo = Awaited<ReturnType<typeof listMemosFn>>[number];

function attachmentUrl(att: Memo["attachments"][number]) {
  return `/api/files?key=${encodeURIComponent(att.reference)}`;
}

const visibilityLabel: Record<string, string> = {
  PRIVATE: "私有",
  PUBLIC: "公开",
  PROTECTED: "工作区",
};

function FormattedTime({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Skeleton className="inline-block h-3 w-24 align-middle" />;
  }

  let instant: Temporal.Instant;
  try {
    instant = Temporal.Instant.from(date);
  } catch {
    return <>{date}</>;
  }
  return (
    <>
      {new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(instant.epochMilliseconds)}
    </>
  );
}

function ImagePreview({
  src,
  filename,
  onClose,
}: {
  src: string;
  filename: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        role="presentation"
        onClick={onClose}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-white/70 hover:text-white"
          onClick={onClose}
        >
          <XIcon className="size-6" />
        </button>
        <img
          src={src}
          alt={filename}
          className="max-h-full max-w-full rounded object-contain"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
    </>
  );
}

function MemoList({ memos }: { memos: Memo[] }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    getSessionFn().then((session) => {
      setCurrentUserId(session?.user?.id);
    });
  }, []);

  if (!memos.length) {
    return (
      <div className="mt-8 rounded-md border border-dashed px-3 py-8 text-center text-muted-foreground text-xs">
        没有找到数据
      </div>
    );
  }

  return (
    <>
      {preview && (
        <ImagePreview
          src={preview}
          filename=""
          onClose={() => setPreview(null)}
        />
      )}
      <div className="mt-8 space-y-3">
        {memos.map((memo) => (
          <div
            key={memo.uid}
            className="group/memo relative rounded-lg border bg-card p-4 text-sm"
          >
            <div className="leading-relaxed">
              <LexicalRenderer payload={memo.payload} />
            </div>
            {memo.attachments && memo.attachments.length > 0 && (
              <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
                {memo.attachments.map((att) =>
                  att.type.startsWith("image/") ? (
                    <button
                      key={att.uid}
                      type="button"
                      className="group relative aspect-video overflow-hidden rounded-md bg-muted/50"
                      onClick={() => setPreview(attachmentUrl(att))}
                    >
                      <img
                        src={attachmentUrl(att)}
                        alt={att.filename}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                    </button>
                  ) : (
                    <a
                      key={att.uid}
                      href={attachmentUrl(att)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-2 text-xs transition-colors hover:bg-muted/80"
                    >
                      {att.type.startsWith("video/") ? (
                        <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 truncate text-muted-foreground">
                        {att.filename}
                      </span>
                    </a>
                  ),
                )}
              </div>
            )}
            <MemoReactions
              contentId={memo.uid}
              currentUserId={currentUserId}
            />
            <div className="mt-2 flex items-center gap-2 text-muted-foreground text-xs">
              <span>{visibilityLabel[memo.visibility] ?? memo.visibility}</span>
              <FormattedTime date={memo.createdAt} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export { MemoList };
```

Key changes from original:
- Added `group/memo` class to the card div for the `group-hover/memo:` selector in MemoReactions
- Added `useEffect` to fetch current user session
- Added `<MemoReactions>` component below attachments, above metadata
- Changed import paths

- [ ] **Step 2: Update home.tsx import path**

Edit `apps/web/src/routes/_memos/_protected/home.tsx`:
```tsx
// Change this line:
import { MemoList } from "@/features/editor/components/memo-list";
// To this:
import { MemoList } from "@/features/memos/components/memo-list";
```

- [ ] **Step 3: Delete old memo-list.tsx from editor**

```bash
rm apps/web/src/features/editor/components/memo-list.tsx
```

- [ ] **Step 4: Verify TypeScript**

Run: `cd apps/web && npx tsc --noEmit --pretty 2>&1 | head -40`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/memos/components/memo-list.tsx \
       apps/web/src/routes/_memos/_protected/home.tsx
git rm apps/web/src/features/editor/components/memo-list.tsx
git commit -m "refactor: migrate memo-list to features/memos and integrate reactions"
```

---

### Task 7: Verify the build

- [ ] **Step 1: Run type check**

```bash
cd apps/web && npx tsc --noEmit --pretty 2>&1
```

Expected: No type errors

- [ ] **Step 2: Run lint**

Check for available lint commands:
```bash
cat apps/web/package.json | grep -E '"lint|"check'
```

Then run the appropriate command.
