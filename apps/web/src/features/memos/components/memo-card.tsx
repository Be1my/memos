import { Temporal } from "@js-temporal/polyfill";
import { Skeleton } from "@memos/ui/components/skeleton";
import { useEffect, useState } from "react";
import { useTimezone } from "@/lib/timezone-context";
import { LexicalRenderer } from "../../editor/components/lexical-renderer";
import type { listMemosFn } from "../../editor/functions/list-memos.function";
import { AttachmentGrid } from "./attachment-grid";
import { MemoReactions } from "./memo-reactions";
import { ReactionTrigger } from "./reaction-trigger";

type Memo = Awaited<ReturnType<typeof listMemosFn>>[number];

const visibilityLabel: Record<string, string> = {
	PRIVATE: "私有",
	PUBLIC: "公开",
	PROTECTED: "工作区",
};

function FormattedTime({ date }: { date: string }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const { timeZone } = useTimezone();

	if (!mounted) {
		return <Skeleton className="inline-block h-3 w-24 align-middle" />;
	}

	let instant: Temporal.Instant;
	try {
		instant = Temporal.Instant.from(date);
	} catch {
		return <>{date}</>;
	}
	return (
		<>
			{new Intl.DateTimeFormat(undefined, {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				timeZone,
			}).format(instant.epochMilliseconds)}
		</>
	);
}

function MemoCard({ memo, userId }: { memo: Memo; userId?: string | null }) {
	return (
		<div className="group/memo relative rounded-lg border bg-card p-4 text-sm">
			<div className="mb-3 flex items-center justify-between text-muted-foreground text-xs">
				<div className="flex items-center gap-2">
					<span>{visibilityLabel[memo.visibility] ?? memo.visibility}</span>
					<FormattedTime date={memo.createdAt} />
				</div>
				{userId && (
					<ReactionTrigger contentId={memo.uid} currentUserId={userId} />
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
