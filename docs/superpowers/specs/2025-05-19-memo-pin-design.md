# Memo Pin Feature

## Summary

Add ability for users to pin memos to the top of their memo list. Users can pin multiple memos simultaneously; pinned memos are sorted by creation time descending.

## Database

The `memo` table already has a `pinned` boolean column (`NOT NULL DEFAULT false`). No schema changes needed.

## Server Functions

### `toggle-pin.function.ts` (new)

- `createServerFn({ method: "POST" })` with `.inputValidator(z.object({ memoId: z.string() }))`
- Auth: verify `session?.user.id` matches `memo.creatorId`
- SQL: `UPDATE memo SET pinned = NOT pinned WHERE uid = memoId` (toggle)
- Return: updated memo fields (uid, pinned)

### `list-memos.shared.ts` (modify)

- Add optional `orderByPinned?: boolean` parameter to `queryMemos`
- When `true`: `orderBy(desc(memo.pinned), desc(memo.createdAt))`
- When `false`/undefined: `orderBy(desc(memo.createdAt))` (current behavior)
- Add `pinned: m.pinned` to the return object mapping

### `list-memos.function.ts` (modify)

- Pass `orderByPinned: true` to `queryMemos`

## React Query

### `pin-memo.query.ts` (new)

Mutation hook `useTogglePin()` following existing `useToggleReaction` optimistic update pattern:

- `onMutate`: cancel `["memos"]` queries → snapshot via `getQueriesData` → `setQueriesData` to flip `memo.pinned` → return snapshot
- `onError`: restore queries from snapshot → toast error
- `onSettled`: `invalidateQueries({ queryKey: ["memos"] })`

## Component Changes

### `memo-card.tsx`

- Show `PinIcon` (filled, small) in the header left area when `memo.pinned === true`

### `memo-card-actions.tsx`

- Import and call `useTogglePin()`
- Wire onClick on the Pin menu item:
  - State: `PinIcon` always shown
  - Label text: "固定" when unpinned, "取消固定" when pinned
  - Callback: `togglePin.mutate({ memoId: memo.uid })`

## Data Flow

```
User clicks "固定" in dropdown
  → onMutate: memo.pinned flipped in cache immediately
  → UI updates: memo jumps to top (if pinned) or back (if unpinned)
  → togglePin server function: DB UPDATE
  → onError: cache rolled back, toast shown
  → onSettled: ["memos"] invalidated, refetched from server
```

## Out of Scope

- No pin indicator on explore page (only user's own list)
- No drag-to-reorder pinned memos
- No pin count or admin pin management
- No separate pinned section header in the list
