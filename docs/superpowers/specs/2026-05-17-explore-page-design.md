# Explore Page

## Goal

Implement an explore page that lets users discover memos from across the workspace, with visibility-based access control.

## Access Rules

| User type | Can see |
|-----------|---------|
| Unauthenticated (visitor) | All `PUBLIC` memos from all users |
| Authenticated | `PUBLIC` + `PROTECTED` from all users, plus all of their own memos (including `PRIVATE`) |

## Approach

Extract the shared DB query logic from `list-memos.function.ts` into a reusable helper, then create a separate `listExploreMemosFn` that builds visibility-based conditions.

## Architecture

```
list-memos.shared.ts          ← extracted DB query logic (join attachments/reactions, build memoMap)
       ↙                    ↘
list-memos.function.ts       list-explore-memos.function.ts
  (own memos, home page)       (visibility-based, explore page)
```

### Shared layer (`list-memos.shared.ts`)

- `queryMemos(conditions, filter)` — takes an array of drizzle conditions + search filter, runs the DB query with left joins, builds memoMap, fetches reactions, returns serialized memo list.

### `listExploreMemosFn`

```
IF session exists:
  WHERE (visibility IN ('PUBLIC', 'PROTECTED') OR creatorId = session.user.id)
ELSE:
  WHERE visibility = 'PUBLIC'
```

Conditions are combined with `q`/`date`/`tag` search filters.

### Query / Cache

```
queryKey: ["explore-memos", filter]
```
Independent from home page's `["memos", filter]` — no cache conflicts.

## Files Changed

| File | Action |
|------|--------|
| `apps/web/src/features/editor/functions/list-memos.function.ts` | Refactor: extract shared query logic into `list-memos.shared.ts` |
| `apps/web/src/features/editor/functions/list-memos.shared.ts` | **Create**: `queryMemos()` helper |
| `apps/web/src/features/editor/functions/list-explore-memos.function.ts` | **Create**: explore server function |
| `apps/web/src/features/editor/queries/list-explore-memos.query.ts` | **Create**: queryOptions with key `["explore-memos", filter]` |
| `apps/web/src/routes/_memos/explore.tsx` | **Rewrite**: full page with loader + MemoList |

## Components

- `<Editor>` — **not included** on explore page
- `<MemoList>` / `<MemoCard>` / `<SearchPanel>` — reused as-is
- Visibility badges already rendered in MemoCard — no changes needed

## Scope

No routing, sidebar, or auth changes. Explore is already in the sidebar and `_memos/index.tsx` already redirects appropriately. The styling and scrolling match home page (max-w-2xl, px-4, pt-8).
