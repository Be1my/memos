# Explore Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement explore page with visibility-based access control

**Architecture:** Extract shared DB query logic from `listMemosFn` into a helper, create a new `listExploreMemosFn` with visibility conditions, add queryOptions, wire up route

**Tech Stack:** TanStack Start (server functions), Drizzle ORM, TanStack Query, TanStack Router

---

### Task 1: Extract shared query logic

**Files:**
- Modify: `apps/web/src/features/editor/functions/list-memos.function.ts`
- Create: `apps/web/src/features/editor/functions/list-memos.shared.ts`

- [ ] **Step 1: Create `list-memos.shared.ts`**

Move the following from `listMemosFn` into an exported `queryMemos(conditions, filter)` function:
- Dynamic imports of DB/drizzle modules
- `createDb()`
- q/date/tag filter condition building
- The main query (select + leftJoin + where + orderBy + limit)
- memoMap construction
- Reactions fetching and mapping
- Serialization and return

```ts
import { Temporal } from "@js-temporal/polyfill";
import type { SQL } from "drizzle-orm";

export interface ListMemosFilter {
  q?: string;
  date?: string;
  tag?: string;
}

export interface SerializedMemo {
  id: number;
  uid: string;
  content: string;
  payload: unknown;
  visibility: "PRIVATE" | "PUBLIC" | "PROTECTED";
  tags: string[];
  createdAt: string;
  attachments: Array<{
    id: number;
    uid: string;
    filename: string;
    type: string;
    size: number;
    storageType: string;
    reference: string;
  }>;
  reactions: Array<{
    id: number;
    creatorId: string;
    creatorName: string;
    reactionType: string;
  }>;
}

export async function queryMemos(
  conditions: SQL[],
  filter?: ListMemosFilter,
): Promise<SerializedMemo[]> {
  const [
    { createDb },
    { memo },
    { attachment },
    { reaction },
    { user },
    { desc, eq, like, and, sql, inArray },
  ] = await Promise.all([
    import("@memos/db"),
    import("@memos/db/schema/memo.table"),
    import("@memos/db/schema/attachment.table"),
    import("@memos/db/schema/reaction.table"),
    import("@memos/db/schema/auth.table"),
    import("drizzle-orm"),
  ]);

  const db = createDb();

  if (filter?.q) {
    conditions.push(like(memo.content, `%${filter.q}%`));
  }

  if (filter?.date) {
    const start = Temporal.PlainDate.from(filter.date);
    const end = start.add({ days: 1 });
    conditions.push(
      sql`${memo.createdAt} >= ${start.toString()}::timestamptz AND ${memo.createdAt} < ${end.toString()}::timestamptz`,
    );
  }

  if (filter?.tag) {
    conditions.push(sql`${filter.tag} = ANY(${memo.tags})`);
  }

  const rows = await db
    .select()
    .from(memo)
    .leftJoin(attachment, eq(attachment.memoId, memo.id))
    .where(and(...conditions))
    .orderBy(desc(memo.createdAt))
    .limit(20);

  const memoMap = new Map<
    number,
    typeof memo.$inferSelect & {
      attachments: (typeof attachment.$inferSelect)[];
    }
  >();
  for (const row of rows) {
    if (!memoMap.has(row.memo.id)) {
      memoMap.set(row.memo.id, { ...row.memo, attachments: [] });
    }
    if (row.attachment) {
      memoMap.get(row.memo.id)?.attachments.push(row.attachment);
    }
  }

  const memosList = Array.from(memoMap.values());

  const uids = memosList.map((m) => m.uid);
  const reactionsRows =
    uids.length > 0
      ? await db
          .select({
            id: reaction.id,
            reactionType: reaction.reactionType,
            creatorId: reaction.creatorId,
            creatorName: user.name,
            contentId: reaction.contentId,
          })
          .from(reaction)
          .innerJoin(user, eq(user.id, reaction.creatorId))
          .where(inArray(reaction.contentId, uids))
          .orderBy(reaction.createdAt)
      : [];

  const reactionsByContentId = new Map<string, typeof reactionsRows>();
  for (const r of reactionsRows) {
    const existing = reactionsByContentId.get(r.contentId) ?? [];
    existing.push(r);
    reactionsByContentId.set(r.contentId, existing);
  }

  return memosList.map((m) => ({
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
    reactions: (reactionsByContentId.get(m.uid) ?? []).map((r) => ({
      id: r.id,
      creatorId: r.creatorId,
      creatorName: r.creatorName,
      reactionType: r.reactionType,
    })),
  }));
}
```

- [ ] **Step 2: Refactor `list-memos.function.ts` to use shared helper**

```ts
import { createServerFn } from "@tanstack/react-start";
import type { ListMemosFilter } from "./list-memos.shared";
import { queryMemos } from "./list-memos.shared";

export const listMemosFn = createServerFn({
  method: "GET",
  strict: false,
}).handler(async (data: unknown) => {
  const filter = (data ?? {}) as ListMemosFilter;

  const [{ eq }, { createAuth }, { getRequestHeaders }] = await Promise.all([
    import("drizzle-orm"),
    import("@memos/auth"),
    import("@tanstack/react-start/server"),
  ]);
  const { memo } = await import("@memos/db/schema/memo.table");

  const headers = getRequestHeaders();
  const session = await createAuth().api.getSession({ headers });

  const conditions = [eq(memo.creatorId, session?.user.id ?? "")];
  return queryMemos(conditions, filter);
});
```

---

### Task 2: Create explore server function

**Files:**
- Create: `apps/web/src/features/editor/functions/list-explore-memos.function.ts`

- [ ] **Step 1: Create `list-explore-memos.function.ts`**

```ts
import { createServerFn } from "@tanstack/react-start";
import type { ListMemosFilter } from "./list-memos.shared";
import { queryMemos } from "./list-memos.shared";

export const listExploreMemosFn = createServerFn({
  method: "GET",
  strict: false,
}).handler(async (data: unknown) => {
  const filter = (data ?? {}) as ListMemosFilter;

  const [
    { createAuth },
    { getRequestHeaders },
    { eq, sql },
  ] = await Promise.all([
    import("@memos/auth"),
    import("@tanstack/react-start/server"),
    import("drizzle-orm"),
  ]);
  const { memo } = await import("@memos/db/schema/memo.table");

  const headers = getRequestHeaders();
  const session = await createAuth().api.getSession({ headers });

  const conditions: import("drizzle-orm").SQL[] = [];

  if (session?.user) {
    conditions.push(
      sql`(${memo.visibility} IN ('PUBLIC', 'PROTECTED') OR ${memo.creatorId} = ${session.user.id})`,
    );
  } else {
    conditions.push(eq(memo.visibility, "PUBLIC"));
  }

  return queryMemos(conditions, filter);
});
```

---

### Task 3: Create explore query options

**Files:**
- Create: `apps/web/src/features/editor/queries/list-explore-memos.query.ts`

- [ ] **Step 1: Create `list-explore-memos.query.ts`**

```ts
import { queryOptions } from "@tanstack/react-query";
import {
  type ListMemosFilter,
} from "../functions/list-memos.shared";
import { listExploreMemosFn } from "../functions/list-explore-memos.function";

const listExploreMemos = (filter?: ListMemosFilter) =>
  listExploreMemosFn(filter as never);

export const listExploreMemosQueryOptions = (filter?: ListMemosFilter) =>
  queryOptions({
    queryKey: ["explore-memos", filter],
    queryFn: () => listExploreMemos(filter),
  });
```

---

### Task 4: Wire up explore route

**Files:**
- Modify: `apps/web/src/routes/_memos/explore.tsx`

- [ ] **Step 1: Rewrite `explore.tsx`**

```tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { listExploreMemosQueryOptions } from "@/features/editor/queries/list-explore-memos.query";
import { MemoList } from "@/features/memos/components/memo-list";

const searchSchema = z.object({
  q: z.string().optional(),
  date: z.string().optional(),
  tag: z.string().optional(),
});

export const Route = createFileRoute("/_memos/explore")({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { q, date, tag } }) => ({ q, date, tag }),
  loader: async ({
    context: { queryClient, user },
    deps: { q, date, tag },
  }) => {
    const filter = { q, date, tag };
    const memos = await queryClient.ensureQueryData(
      listExploreMemosQueryOptions(filter),
    );
    return {
      memos,
      filter,
      userId: (user as { id?: string } | null)?.id ?? null,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { filter, userId } = Route.useLoaderData();
  const { data: memos } = useSuspenseQuery(
    listExploreMemosQueryOptions(filter),
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-8">
      <MemoList memos={memos} userId={userId} />
    </div>
  );
}
```

---

### Verification

- [ ] **Step 1: Type check**
  Run: `bun run --filter=web typecheck` (or the project's typecheck command)
  Expected: no type errors

- [ ] **Step 2: Build check**
  Run: `bun run --filter=web build` (or the project's build command)
  Expected: build succeeds

- [ ] **Step 3: Manual sanity check**
  - Visit `/explore` while logged out → should see only PUBLIC memos
  - Visit `/explore` while logged in → should see PUBLIC + PROTECTED + own memos
  - Search/filter (q, date, tag) should work on explore page
  - Home page (`/home`) should remain unchanged
