# Home Page Rich Text Editor (Lexical)

## Overview

Add a Lexical-based rich text input box to the home page for creating memos with basic formatting support.

## Architecture

### Component Tree

```
home.tsx
  └── Editor              (features/editor/components/editor.tsx)
        ├── LexicalComposer
        ├── RichTextPlugin
        ├── HistoryPlugin
        ├── FloatingToolbarPlugin  (features/editor/components/floating-toolbar.tsx)
        └── OnChangePlugin
```

### Components

**editor.tsx** — Wraps Lexical with a styled container. Exposes `onChange` and `onSubmit` callbacks. Manages LexicalComposer with shared config.

**floating-toolbar.tsx** — Renders a floating toolbar positioned near text selection. Shows Bold (`B`) and Italic (`I`) buttons. Uses `$getSelection` and `$isRangeSelection` to detect active formats and toggle them via `$toggleBold`, `$toggleItalic`.

### Data Flow

- User types / formats text → Lexical internal state
- `OnChangePlugin` captures editor state → calls parent `onChange(editorState)`
- Submit button in home.tsx calls `editorState.toJSON()` for persistence

### Styling

- Styled with Tailwind CSS v4, matching @memos/ui component patterns
- Floating toolbar: absolute positioned near selection, bg-neutral-900/800, rounded-lg, shadow, small gap
- Editor container: rounded border, padding, min-height, placeholder styling consistent with existing inputs

### Extensibility

New formatting options added in 3 steps:
1. Register node/plugin in editor.tsx config
2. Add toolbar button in floating-toolbar.tsx
3. (Future) add keyboard shortcuts if needed

## Dependencies

- `lexical` — core
- `@lexical/react` — React bindings (LexicalComposer, RichTextPlugin, etc.)
- (peer deps: react, react-dom already present)

## Out of Scope

- Backend persistence (submit callback for parent to handle)
- Image uploads, embeds, code blocks
- Slash commands
