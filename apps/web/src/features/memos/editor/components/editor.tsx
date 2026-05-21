import { HashtagNode } from "@lexical/hashtag";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
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
import type { EditorState, SerializedEditorState } from "lexical";
import { $getRoot } from "lexical";
import {
	FileIcon,
	GlobeIcon,
	ImageIcon,
	LockIcon,
	PlusIcon,
	SaveIcon,
	UsersIcon,
	XIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { editorTheme } from "../editor-theme";
import type { FilePayload } from "../../functions/create-memo.function";
import { getUploadPresignedUrlsFn } from "@/lib/get-upload-urls.function";
import { FloatingToolbar } from "./floating-toolbar";
import { MemoDatetime } from "./memo-datetime";
import { TagAutocompletePlugin } from "./tag-autocomplete-plugin";

const placeholder = "Write something...";

interface PendingFile {
	id: string;
	file: File;
}

function formatSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const units = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

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
		visibility: string;
		tags?: string[];
		files?: FilePayload[];
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
	const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
	const [createdAt, setCreatedAt] = useState<string | null>(null);
	const mediaInputRef = useRef<HTMLInputElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

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

		let filePayloads: FilePayload[] = [];
		if (pendingFiles.length > 0) {
			try {
				const { urls } = await getUploadPresignedUrlsFn({
					data: {
						files: pendingFiles.map((pf) => ({
							name: pf.file.name,
							type: pf.file.type,
							size: pf.file.size,
						})),
					},
				});

				filePayloads = await Promise.all(
					urls.map(async (entry, i) => {
						const pf = pendingFiles[i];
						const res = await fetch(entry.url, {
							method: "PUT",
							body: pf.file,
							headers: { "Content-Type": pf.file.type },
						});
						if (!res.ok) {
							throw new Error(`Failed to upload ${pf.file.name}`);
						}
						return {
							name: pf.file.name,
							type: pf.file.type,
							size: pf.file.size,
							key: entry.key,
						};
					}),
				);
			} catch (err) {
				toast.error(err instanceof Error ? err.message : "文件上传失败");
				return;
			}
		}

		onSave?.({
			content,
			payload: state.toJSON(),
			visibility,
			tags,
			files: filePayloads,
			...(createdAt ? { createdAt } : {}),
		});
	}, [onSave, visibility, isSaving, pendingFiles, createdAt]);

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
			<input
				type="file"
				ref={mediaInputRef}
				accept="image/*,video/*"
				multiple
				className="hidden"
				onChange={(e) => {
					const files = Array.from(e.target.files ?? []);
					setPendingFiles((prev) => [
						...prev,
						...files.map((f) => ({ id: crypto.randomUUID(), file: f })),
					]);
					e.target.value = "";
				}}
			/>
			<input
				type="file"
				ref={fileInputRef}
				accept="*/*"
				multiple
				className="hidden"
				onChange={(e) => {
					const files = Array.from(e.target.files ?? []);
					setPendingFiles((prev) => [
						...prev,
						...files.map((f) => ({ id: crypto.randomUUID(), file: f })),
					]);
					e.target.value = "";
				}}
			/>
			{pendingFiles.length > 0 && (
				<div className="flex flex-wrap gap-2 px-3.5 py-2">
					{pendingFiles.map((f) => (
						<div
							key={f.id}
							className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs"
						>
							{f.file.type.startsWith("image/") ||
							f.file.type.startsWith("video/") ? (
								<ImageIcon className="size-3.5 shrink-0" />
							) : (
								<FileIcon className="size-3.5 shrink-0" />
							)}
							<span className="max-w-[120px] truncate">{f.file.name}</span>
							<span className="text-muted-foreground">
								{formatSize(f.file.size)}
							</span>
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={() =>
									setPendingFiles((prev) => prev.filter((p) => p.id !== f.id))
								}
								className="ml-0.5"
							>
								<XIcon className="size-3" />
							</Button>
						</div>
					))}
				</div>
			)}
			<div className="flex items-center justify-between px-3.5 py-2">
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="secondary"
								size="icon-sm"
								className="bg-muted hover:bg-muted-foreground/20"
							>
								<PlusIcon className="size-4" />
							</Button>
						}
					/>
					<DropdownMenuContent align="start">
						<DropdownMenuItem onClick={() => mediaInputRef.current?.click()}>
							<ImageIcon className="size-4" />
							Media
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
							<FileIcon className="size-4" />
							File
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
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
