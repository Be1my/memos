import type { listMemosFn } from "../functions/list-memos.function";

type Memo = Awaited<ReturnType<typeof listMemosFn>>[number];

const visibilityLabel: Record<string, string> = {
	PRIVATE: "私有",
	PUBLIC: "公开",
	PROTECTED: "工作区",
};

function MemoList({ memos }: { memos: Memo[] }) {
	if (!memos.length) {
		return null;
	}

	return (
		<div className="mt-8 space-y-3">
			{memos.map((memo) => (
				<div key={memo.uid} className="rounded-lg border bg-card p-4 text-sm">
					<p className="whitespace-pre-wrap break-words leading-relaxed text-foreground">
						{memo.content}
					</p>
					<div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
						<span>{visibilityLabel[memo.visibility] ?? memo.visibility}</span>
						<span>{new Date(memo.createdAt).toLocaleString()}</span>
					</div>
				</div>
			))}
		</div>
	);
}

export { MemoList };
