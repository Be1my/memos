# Home Page Rich Text Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Lexical-based rich text input box on the home page with bold/italic support via floating toolbar.

**Architecture:** A Lexical editor wrapped in a styled card-like container, with a floating toolbar that appears on text selection. Editor state is managed locally and exposed via callbacks to the home page.

**Tech Stack:** React 19, Lexical, @lexical/react, Tailwind CSS v4, TanStack Router

---

### Task 1: Install Lexical dependencies

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Add lexical packages**

Add to `apps/web/package.json` dependencies:
```json
"lexical": "^0.27.0",
"@lexical/react": "^0.27.0"
```

- [ ] **Step 2: Install**

Run: `bun install`

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json bun.lock
git commit -m "feat: add lexical and @lexical/react dependencies"
```

---

### Task 2: Create editor theme styles

**Files:**
- Create: `apps/web/src/features/editor/editor-theme.ts`

- [ ] **Step 1: Create theme file**

```ts
import type { EditorThemeClasses } from "lexical";

export const editorTheme: EditorThemeClasses = {
  paragraph: "m-0 leading-relaxed",
  text: {
    bold: "font-bold",
    italic: "italic",
  },
  placeholder: "text-muted-foreground pointer-events-none absolute top-3.5 left-3.5 select-none overflow-hidden text-ellipsis whitespace-nowrap",
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/editor/editor-theme.ts
git commit -m "feat: add Lexical editor theme"
```

---

### Task 3: Create floating toolbar component

**Files:**
- Create: `apps/web/src/features/editor/components/floating-toolbar.tsx`

- [ ] **Step 1: Create FloatingToolbar component**

```tsx
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef, useState } from "react";

function FloatingToolbar() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const updatePosition = useCallback(() => {
    const domSelection = window.getSelection();
    if (
      !domSelection ||
      domSelection.isCollapsed ||
      !domSelection.rangeCount
    ) {
      setShow(false);
      return;
    }
    const rect = domSelection.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setShow(false);
      return;
    }
    setPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    setShow(true);
  }, []);

  useEffect(() => {
    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat("bold"));
          setIsItalic(selection.hasFormat("italic"));
          updatePosition();
        } else {
          setShow(false);
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
    return unregister;
  }, [editor, updatePosition]);

  useEffect(() => {
    document.addEventListener("selectionchange", updatePosition);
    return () =>
      document.removeEventListener("selectionchange", updatePosition);
  }, [updatePosition]);

  if (!show) return null;

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Text formatting"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
      }}
      className="z-50 flex items-center gap-0.5 rounded-lg border bg-popover p-1 shadow-lg"
    >
      <ToolbarButton
        label="Bold"
        active={isBold}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <span className="font-bold text-sm">B</span>
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={isItalic}
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
        }
      >
        <span className="italic text-sm font-serif">I</span>
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      data-active={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted data-[active=true]:bg-muted data-[active=true]:text-foreground"
    >
      {children}
    </button>
  );
}

export { FloatingToolbar };
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/editor/components/floating-toolbar.tsx
git commit -m "feat: add floating toolbar for text formatting"
```

---

### Task 4: Create editor input component

**Files:**
- Create: `apps/web/src/features/editor/components/editor.tsx`

- [ ] **Step 1: Create Editor component**

```tsx
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import type { EditorState } from "lexical";
import { editorTheme } from "../editor-theme";
import { FloatingToolbar } from "./floating-toolbar";

const placeholder = "Write something...";

function Editor({
  onChange,
}: {
  onChange?: (editorState: EditorState) => void;
}) {
  const initialConfig: InitialConfigType = {
    namespace: "MemoEditor",
    theme: editorTheme,
    onError: (error: Error) => console.error(error),
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative min-h-[120px] rounded-xl border bg-card py-3.5 px-3.5 text-sm ring-1 ring-foreground/10 focus-within:ring-2 focus-within:ring-ring">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="relative min-h-[80px] outline-none" />
          }
          placeholder={
            <div className="pointer-events-none absolute top-3.5 left-3.5 select-none overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <FloatingToolbar />
      </div>
    </LexicalComposer>
  );
}

export { Editor };
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/editor/components/editor.tsx
git commit -m "feat: add Lexical editor component with rich text support"
```

---

### Task 5: Integrate editor into home page

**Files:**
- Modify: `apps/web/src/routes/_memos/home.tsx`

- [ ] **Step 1: Update home page route**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Editor } from "@/features/editor/components/editor";

export const Route = createFileRoute("/_memos/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-8">
      <Editor />
    </div>
  );
}
```

- [ ] **Step 2: Verify app builds**

Run: `bun run check-types`
Expected: No type errors

Run: `bun run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/_memos/home.tsx
git commit -m "feat: integrate rich text editor into home page"
```

---

## File Summary

| File | Action |
|------|--------|
| `apps/web/package.json` | Add lexical, @lexical/react |
| `apps/web/src/features/editor/editor-theme.ts` | Create |
| `apps/web/src/features/editor/components/floating-toolbar.tsx` | Create |
| `apps/web/src/features/editor/components/editor.tsx` | Create |
| `apps/web/src/routes/_memos/home.tsx` | Modify |
