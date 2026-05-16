import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { Button } from "@memos/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@memos/ui/components/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@memos/ui/components/select";
import type { EditorState } from "lexical";
import { EllipsisIcon, SaveIcon } from "lucide-react";
import { useState } from "react";
import { editorTheme } from "../editor-theme";
import { FloatingToolbar } from "./floating-toolbar";

const placeholder = "Write something...";

function Editor({
	onChange,
}: {
	onChange?: (editorState: EditorState) => void;
}) {
	const [visibility, setVisibility] = useState("private");

	const initialConfig: InitialConfigType = {
		namespace: "MemoEditor",
		theme: editorTheme,
		onError: (error: Error) => console.error(error),
	};

	return (
		<div className="rounded-xl border bg-card ring-1 ring-foreground/10 focus-within:ring-2 focus-within:ring-ring">
			<LexicalComposer initialConfig={initialConfig}>
				<div className="max-h-[240px] min-h-[100px] overflow-y-auto px-3.5 py-3.5 text-sm">
					<RichTextPlugin
						contentEditable={
							<ContentEditable className="relative outline-none" />
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
			<div className="flex items-center justify-between border-t px-3.5 py-2">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button variant="ghost" size="icon-sm">
								<EllipsisIcon className="size-4" />
							</Button>
						}
					/>
					<DropdownMenuContent align="start">
						<DropdownMenuItem>Pin to top</DropdownMenuItem>
						<DropdownMenuItem>Add tag</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<div className="flex items-center gap-2">
					<Select value={visibility} onValueChange={setVisibility}>
						<SelectTrigger className="w-28" size="sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="private">私有</SelectItem>
							<SelectItem value="workspace">工作区</SelectItem>
							<SelectItem value="public">公开</SelectItem>
						</SelectContent>
					</Select>
					<Button size="sm">
						<SaveIcon className="size-4" />
						保存
					</Button>
				</div>
			</div>
		</div>
	);
}

export { Editor };
