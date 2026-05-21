import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@memos/ui/components/tooltip";
import type { SerializedEditorState } from "lexical";
import { GlobeIcon, LockIcon, PinIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { Editor } from "../editor/components/editor";
import { LexicalRenderer } from "../editor/components/lexical-renderer";
import type { listMemosFn } from "../editor/functions/list-memos.function";
import { useUpdateMemo } from "../editor/queries/update-memo.query";
import { useTogglePin } from "../queries/pin-memo.query";
import { AttachmentGrid } from "./attachment-grid";
import { MemoCardActions } from "./memo-card-actions";
import { MemoReactions } from "./memo-reactions";
import { MemoTimeDisplay } from "./memo-time-display";
import { ReactionTrigger } from "./reaction-trigger";

type Memo = Awaited<ReturnType<typeof listMemosFn>>[number];

const visibilityLabel: Record<string, string> = {
	PRIVATE: "私有",
	PUBLIC: "公开",
	PROTECTED: "工作区",
};

const visibilityIcon: Record<string, typeof GlobeIcon> = {
	PRIVATE: LockIcon,
	PUBLIC: GlobeIcon,
	PROTECTED: UsersIcon,
};

const visibilityReverseMap: Record<string, string> = {
	PRIVATE: "private",
	PUBLIC: "public",
	PROTECTED: "workspace",
};

function MemoCard({
	memo,
	userId,
	showVisibility = true,
}: {
	memo: Memo;
	userId?: string | null;
	showVisibility?: boolean;
}) {
	const togglePin = useTogglePin();
	const updateMemo = useUpdateMemo();
	const [isEditing, setIsEditing] = useState(false);

	const handleEditSave = (data: {
		content: string;
		payload: SerializedEditorState;
		visibility: string;
		tags?: string[];
		files?: { name: string; type: string; size: number; key: string }[];
		createdAt?: string;
	}) => {
		updateMemo.mutate(
			{
				data: {
					memoId: memo.uid,
					content: data.content,
					payload: data.payload as unknown as Record<string, unknown>,
					visibility: data.visibility,
					createdAt: data.createdAt,
				},
			},
			{
				onSuccess: () => setIsEditing(false),
				onError: () => setIsEditing(false),
			},
		);
	};

	const handleEditCancel = () => {
		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<Editor
				onSave={handleEditSave}
				isSaving={updateMemo.isPending}
				initialEditorState={memo.payload}
				initialVisibility={visibilityReverseMap[memo.visibility] ?? "private"}
				initialCreatedAt={memo.createdAt}
				onCancel={handleEditCancel}
			/>
		);
	}

	return (
		<div className="group/memo relative rounded-lg border bg-card p-4 text-sm">
			<div className="mb-3 flex items-center justify-between text-muted-foreground text-xs">
				<div className="flex items-center gap-2">
					{memo.pinned && (
						<button
							type="button"
							onClick={() => togglePin.mutate({ data: { memoId: memo.uid } })}
							className="inline-flex items-center justify-center rounded-sm text-muted-foreground transition-all hover:opacity-80"
						>
							<PinIcon className="size-3 fill-current" />
						</button>
					)}
					<MemoTimeDisplay
						createdAt={memo.createdAt}
						updatedAt={memo.updatedAt}
					/>
				</div>
				<div className="flex items-center gap-0.5">
					{userId && (
						<>
							<ReactionTrigger contentId={memo.uid} currentUserId={userId} />
							{showVisibility &&
								(() => {
									const Icon = visibilityIcon[memo.visibility];
									return (
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger
													render={
														<span className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" />
													}
												>
													<Icon className="size-4" />
												</TooltipTrigger>
												<TooltipContent side="top" align="center">
													{visibilityLabel[memo.visibility] ?? memo.visibility}
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									);
								})()}
							<MemoCardActions
								memoUid={memo.uid}
								pinned={memo.pinned}
								onEdit={() => setIsEditing(true)}
							/>
						</>
					)}
				</div>
			</div>
			<div className="leading-relaxed">
				<LexicalRenderer payload={memo.payload} />
			</div>
			{memo.attachments && memo.attachments.length > 0 && (
				<AttachmentGrid attachments={memo.attachments} />
			)}
			<MemoReactions
				contentId={memo.uid}
				currentUserId={userId ?? undefined}
				reactions={memo.reactions}
			/>
		</div>
	);
}

export { MemoCard };
