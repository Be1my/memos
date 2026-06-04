import { HashtagNode } from "@lexical/hashtag";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { Button } from "@/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import type { EditorState, SerializedEditorState } from "lexical";
import { $getRoot } from "lexical";
import {
	GlobeIcon,
	LockIcon,
	SaveIcon,
	UsersIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FilePayload } from "../../functions/create-memo.function";
import { editorTheme } from "../editor-theme";
import { FloatingToolbar } from "./floating-toolbar";
import { MemoDatetime } from "./memo-datetime";
import { TagAutocompletePlugin } from "./tag-autocomplete-plugin";

const placeholder = "Write something...";

function Editor({
	onSave,
	isSaving,
	dateSearch,
	initialEditorState,
	initialVisibility,
	initialCreatedAt,
	onCancel,
}: {
	onSave?: (data: {
		content: string;
		payload: SerializedEditorState;
		visibility: "private" | "workspace" | "public";
		tags?: string[];
		createdAt?: string;
	}) => void;
	isSaving?: boolean;
	dateSearch?: { date?: string };
	initialEditorState?: SerializedEditorState;
	initialVisibility?: string;
	initialCreatedAt?: string;
	onCancel?: () => void;
}) {
	const [visibility, setVisibility] = useState(initialVisibility ?? "private");
	const [hasContent, setHasContent] = useState(false);
	const editorStateRef = useRef<EditorState | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [createdAt, setCreatedAt] = useState<string | null>(null);

	const visibilityOptions = [
		{ value: "private", label: "私有", icon: LockIcon },
		{ value: "workspace", label: "工作区", icon: UsersIcon },
		{ value: "public", label: "公开", icon: GlobeIcon },
	] as const;

	const currentVisibility = visibilityOptions.find(
		(o) => o.value === visibility,
	);

	const handleSave = useCallback(async () => {
		const state = editorStateRef.current;
		if (!state || isSaving) return;

		let content = "";
		state.read(() => {
			content = $getRoot().getTextContent().trim();
		});

		if (!content) return;

		const tags = Array.from(content.matchAll(/#([\w\u4e00-\u9fff]+)/g)).map(
			(m) => m[1],
		);

		onSave?.({
			content,
			payload: state.toJSON(),
			visibility: visibility as "private" | "workspace" | "public",
			tags,
			...(createdAt ? { createdAt } : {}),
		});
	}, [onSave, visibility, isSaving, createdAt]);

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
		return () =>
			el.removeEventListener("keydown", onKeyDown, { capture: true });
	}, [handleSave]);

	const initialConfig: InitialConfigType = {
		namespace: "MemoEditor",
		theme: editorTheme,
		nodes: [HashtagNode],
		onError: (error: Error) => console.error(error),
		editorState: initialEditorState
			? JSON.stringify(initialEditorState)
			: undefined,
	};

	return (
		<div
			ref={containerRef}
			className="rounded-xl border bg-card ring-1 ring-foreground/10 focus-within:ring-2 focus-within:ring-ring"
		>
			<MemoDatetime
				onChange={setCreatedAt}
				dateSearch={dateSearch}
				defaultDate={initialCreatedAt}
			/>
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
					<TagAutocompletePlugin />
					<HashtagPlugin />
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
				<div />
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									variant="ghost"
									className="cursor-default px-2 text-muted-foreground text-sm"
								>
									{currentVisibility && (
										<currentVisibility.icon className="size-4" />
									)}
									{currentVisibility?.label}
								</Button>
							}
						/>
						<DropdownMenuContent align="end">
							{visibilityOptions.map((opt) => (
								<DropdownMenuItem
									key={opt.value}
									onClick={() => setVisibility(opt.value)}
								>
									<opt.icon className="size-4" />
									{opt.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
					{onCancel && (
						<Button size="sm" variant="ghost" onClick={onCancel}>
							取消
						</Button>
					)}
					<Button
						size="sm"
						disabled={!hasContent || isSaving}
						onClick={handleSave}
					>
						<SaveIcon className="size-4" />
						保存
					</Button>
				</div>
			</div>
		</div>
	);
}

export { Editor };