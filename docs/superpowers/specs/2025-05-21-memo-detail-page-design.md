# Memo Detail Page Design

## Overview

Add a dedicated memo detail page at `/memo/$uid` with a comment/reply system. The page shows a single memo's full content and allows authenticated users to comment.

## Route

- **URL:** `/memo/$uid`
- **Route file:** `apps/web/src/routes/_memos/_bare/memo/$uid.tsx`
- **Layout:** `_bare` (SidebarInset only, no SearchPanel)
- **Access control:**
  - PUBLIC memos: anyone can view
  - PROTECTED memos: authenticated users only
  - PRIVATE memos: creator only
  - Comments: authenticated users only

## Components

### `memo-detail.tsx`
Main detail page component. Composes the memo display and comment section.

### `comment-section.tsx`
Container for the comment list and comment editor. Handles loading/error/empty states.

### `comment-item.tsx`
Single comment display with:
- Author avatar + username
- Relative timestamp
- Lexical-rendered content
- Emoji reactions (reuses `MemoReactions`/`ReactionTrigger`)
- Edit/Delete buttons (visible only to comment author)

### `comment-editor.tsx`
Compact Lexical rich text editor for creating and editing comments. Reuses the existing `Editor` component in a compact mode.

## Server Functions

### `get-memo.function.ts`
- Input: `uid: string`
- Fetches memo by uid with creator info, attachments, reactions
- Applies visibility-based access control

### `list-comments.function.ts`
- Input: `memoUid: string`
- Queries `memo_relation` where type=`COMMENT`
- Returns associated comment memos with author and reactions
- Ordered by `createdAt` descending

### `create-comment.function.ts`
- Input: `memoUid: string`, `content: string`, `payload: Record<string, unknown>`
- Creates a new memo (comment content) + `memo_relation` record
- Access control: PRIVATE → creator/admin only; PUBLIC/PROTECTED → any authenticated user

### `update-comment.function.ts`
- Input: `commentUid: string`, `content: string`, `payload: Record<string, unknown>`
- Only comment author can update

### `delete-comment.function.ts`
- Input: `commentUid: string`
- Only comment author can delete

## Data Model

Comments reuse the existing `memo` table (each comment is a memo with `payload` for Lexical state) and are linked to the parent memo via `memo_relation` with type=`COMMENT`. Reactions on comments reuse the existing `reaction` table with `contentId` set to the comment's uid.

## Implementation Order

1. **Server functions:** get-memo, list-comments, create-comment, update-comment, delete-comment
2. **Route + loader:** `_memos/_bare/memo/$uid.tsx`
3. **Components:** memo-detail → comment-section → comment-item → comment-editor
4. **UI interactions:** inline edit, reactions, access control integration

## Branch

Branch name: `feat/memo-detail-page` (from `main`)
