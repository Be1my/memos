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
