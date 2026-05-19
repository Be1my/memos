import { LexicalRenderer } from "../../editor/components/lexical-renderer";
import type { listMemosFn } from "../../editor/functions/list-memos.function";
import { AttachmentGrid } from "./attachment-grid";
import { MemoCardActions } from "./memo-card-actions";
import { MemoReactions } from "./memo-reactions";
import { ReactionTrigger } from "./reaction-trigger";
import { PinIcon } from "lucide-react";

type Memo = Awaited<ReturnType<typeof listMemosFn>>[number];

const visibilityLabel: Record<string, string> = {
	PRIVATE: "私有",
	PUBLIC: "公开",
	PROTECTED: "工作区",
};

function FormattedTime({ formattedTime }: { formattedTime: string }) {
	return <>{formattedTime}</>;
}

function MemoCard({ memo, userId }: { memo: Memo; userId?: string | null }) {
	return (
		<div className="group/memo relative rounded-lg border bg-card p-4 text-sm">
			<div className="mb-3 flex items-center justify-between text-muted-foreground text-xs">
				<div className="flex items-center gap-2">
					{memo.pinned && <PinIcon className="size-3 fill-current" />}
					<span>{visibilityLabel[memo.visibility] ?? memo.visibility}</span>
					<FormattedTime formattedTime={memo.formattedTime} />
				</div>
				{userId && (
					<div className="flex items-center gap-0.5">
						<ReactionTrigger contentId={memo.uid} currentUserId={userId} />
						<MemoCardActions memoUid={memo.uid} pinned={memo.pinned} />
					</div>
				)}
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
