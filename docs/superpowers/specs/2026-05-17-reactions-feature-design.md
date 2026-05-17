# Reactions (Emoji Reactions) Feature Design

## Summary

Add emoji reactions to memo cards. Any authenticated user can add/remove emoji reactions on any memo. Hovering the reaction trigger on a memo card opens an emoji picker. Reactions are displayed as grouped badges with truncated user names.

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `apps/web/src/features/memos/functions/list-reactions.function.ts` | Server fn: list reactions for a memo |
| `apps/web/src/features/memos/functions/toggle-reaction.function.ts` | Server fn: toggle (insert/delete) a reaction |
| `apps/web/src/features/memos/queries/reactions.query.ts` | React Query options for reactions |
| `apps/web/src/features/memos/components/memo-reactions.tsx` | Reactions bar + emoji picker trigger |
| `apps/web/src/features/memos/components/reaction-badge.tsx` | Single emoji group display with truncated users |

### Moved Files

| File | From | To |
|------|------|----|
| `memo-list.tsx` | `features/editor/components/` | `features/memos/components/` |

### Modified Files

| File | Change |
|------|--------|
| `apps/web/src/routes/_memos/_protected/home.tsx` | Update import path for MemoList |
| `packages/db/src/schema/reaction.table.ts` | Add relation to memo (contentId references memo.uid) |

## Database

The `reaction` table already exists in `packages/db/src/schema/reaction.table.ts`:

- `id` — auto-increment PK
- `createdAt` — timestamp
- `creatorId` — FK to user.id
- `contentId` — currently text, will reference memo.uid
- `reactionType` — text (emoji character, e.g. "👏")
- Unique constraint on (creatorId, contentId, reactionType)

No schema changes needed — the table already supports the toggle pattern.

## Server Functions

### `toggleReactionFn`

- Method: POST
- Input: `{ contentId: string, reactionType: string }`
- Logic: Check if a row with (currentUser.id, contentId, reactionType) exists. If yes, DELETE. If no, INSERT.
- Auth: Requires session

### `listReactionsFn`

- Method: GET
- Input: `{ contentId: string }`
- Returns: Array of `{ id, reactionType, creatorId, creatorName, createdAt }`
- Auth: Requires session

## UI Components

### `MemoReactions`

Two visual areas within the same component:
1. **Trigger button** — small "+" icon, absolute-positioned in the top-right corner of the memo card, visible on card hover (CSS group-hover)
2. **Badges bar** — reaction badges grouped by emoji, rendered below memo content and above the timestamp row

- States: loading (skeleton), empty (no reactions, just trigger), populated

### `ReactionBadge`

- Shows emoji + truncated user display:
  - 1: "Alice reacted with 👏"
  - 2: "Alice and Bob reacted with 👏"
  - 3: "Alice, Bob and Charlie reacted with 👏"
  - 4+: "Alice, Bob, Charlie and N-3 more reacted with 👏"
- Click toggles the current user's reaction
- Shows hover details for users who reacted

### Emoji Picker Trigger

- "+" icon button in the top-right corner of the memo card
- Visible on hover (CSS group-hover)
- Desktop: hover opens Popover with EmojiPicker
- Mobile: click opens Popover
- Uses `@base-ui/react` Popover + `frimousse` EmojiPicker

## Data Flow

1. MemoList renders → each MemoCard fetches reactions via `listReactionsFn`
2. User hovers memo card → "+" button appears
3. User hovers/clicks "+" → EmojiPicker popover opens
4. User clicks an emoji → optimistic update + `toggleReactionFn`
5. Server toggles INSERT/DELETE → invalidate reactions query
6. UI re-renders with updated badges

## Edge Cases

- **No session**: trigger hidden, no reactions UI shown
- **Network failure**: optimistic update rolls back, toast error
- **Concurrent toggle**: unique constraint prevents duplicates; DELETE on non-existent row is no-op
- **Empty state**: no trigger shown if user is not logged in; if logged in but no reactions, just show trigger
