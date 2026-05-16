import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { Button } from "@memos/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@memos/ui/components/dropdown-menu";
import type { EditorState } from "lexical";
import { $getRoot } from "lexical";
import { GlobeIcon, LockIcon, PlusIcon, SaveIcon, UsersIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { editorTheme } from "../editor-theme";
import { FloatingToolbar } from "./floating-toolbar";

const placeholder = "Write something...";

function Editor({
	onSave,
	isSaving,
}: {
	onSave?: (data: { content: string; payload: Record<string, unknown>; visibility: string }) => void;
	isSaving?: boolean;
}) {
	const [visibility, setVisibility] = useState("private");
	const [hasContent, setHasContent] = useState(false);
	const editorStateRef = useRef<EditorState | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const visibilityOptions = [
		{ value: "private", label: "私有", icon: LockIcon },
		{ value: "workspace", label: "工作区", icon: UsersIcon },
		{ value: "public", label: "公开", icon: GlobeIcon },
	] as const;

	const currentVisibility = visibilityOptions.find((o) => o.value === visibility);

	const handleSave = useCallback(() => {
		const state = editorStateRef.current;
		if (!state || isSaving) return;

		let content = "";
		state.read(() => {
			content = $getRoot().getTextContent().trim();
		});

		if (!content) return;

		onSave?.({ content, payload: state.toJSON() as unknown as Record<string, unknown>, visibility });
	}, [onSave, visibility, isSaving]);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();
				handleSave();
			}
		};

		el.addEventListener("keydown", onKeyDown, { capture: true });
		return () => el.removeEventListener("keydown", onKeyDown, { capture: true });
	}, [handleSave]);

	const initialConfig: InitialConfigType = {
		namespace: "MemoEditor",
		theme: editorTheme,
		onError: (error: Error) => console.error(error),
	};

	return (
		<div ref={containerRef} className="rounded-xl border bg-card ring-1 ring-foreground/10 focus-within:ring-2 focus-within:ring-ring">
			<LexicalComposer initialConfig={initialConfig}>
				<div className="relative max-h-[240px] min-h-[100px] overflow-y-auto px-3.5 py-3.5 text-sm">
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
					<OnChangePlugin
						onChange={(editorState) => {
							editorStateRef.current = editorState;
							editorState.read(() => {
								setHasContent($getRoot().getTextContent().trim().length > 0);
							});
						}}
					/>
				</div>
			</LexicalComposer>
			<div className="flex items-center justify-between px-3.5 py-2">
				<DropdownMenu>
<DropdownMenuTrigger
						render={<Button variant="secondary" size="icon-sm" className="bg-muted hover:bg-muted-foreground/20"><PlusIcon className="size-4" /></Button>}
					/>
					<DropdownMenuContent align="start">
						<DropdownMenuItem>Pin to top</DropdownMenuItem>
						<DropdownMenuItem>Add tag</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger
							render={(props: any) => (
								<button type="button" {...props} className="flex cursor-default items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground outline-none">
									{currentVisibility && <currentVisibility.icon className="size-4" />}
									{currentVisibility?.label}
								</button>
							)}
						/>
						<DropdownMenuContent align="end">
							{visibilityOptions.map((opt) => (
								<DropdownMenuItem key={opt.value} onClick={() => setVisibility(opt.value)}>
									<opt.icon className="size-4" />
									{opt.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					<Button size="sm" disabled={!hasContent || isSaving} onClick={handleSave}>
						<SaveIcon className="size-4" />
						保存
					</Button>
				</div>
			</div>
		</div>
	);
}

export { Editor };
