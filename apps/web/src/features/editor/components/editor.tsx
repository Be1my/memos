import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
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
