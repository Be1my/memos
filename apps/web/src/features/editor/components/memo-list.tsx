import { Skeleton } from "@memos/ui/components/skeleton";
import { useEffect, useState } from "react";
import type { listMemosFn } from "../functions/list-memos.function";
import { LexicalRenderer } from "./lexical-renderer";

type Memo = Awaited<ReturnType<typeof listMemosFn>>[number];

const visibilityLabel: Record<string, string> = {
	PRIVATE: "私有",
	PUBLIC: "公开",
	PROTECTED: "工作区",
};

function FormattedTime({ date }: { date: string }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return <Skeleton className="inline-block h-3 w-24 align-middle" />;
	}

	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return <>{date}</>;
	return (
		<>
			{new Intl.DateTimeFormat(undefined, {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			}).format(d)}
		</>
	);
}

function MemoList({ memos }: { memos: Memo[] }) {
	if (!memos.length) {
		return (
			<div className="mt-8 rounded-md border border-dashed px-3 py-8 text-center text-xs text-muted-foreground">
				没有找到数据
			</div>
		);
	}

	return (
		<div className="mt-8 space-y-3">
			{memos.map((memo) => (
				<div key={memo.uid} className="rounded-lg border bg-card p-4 text-sm">
					<div className="leading-relaxed">
						<LexicalRenderer payload={memo.payload} />
					</div>
					<div className="mt-2 flex items-center gap-2 text-muted-foreground text-xs">
						<span>{visibilityLabel[memo.visibility] ?? memo.visibility}</span>
						<FormattedTime date={memo.createdAt} />
					</div>
				</div>
			))}
		</div>
	);
}

export { MemoList };
