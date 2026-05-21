import { Button } from "@memos/ui/components/button";
import { ArrowUpIcon } from "lucide-react";
import type { listMemosFn } from "../editor/functions/list-memos.function";
import { MemoCard } from "./memo-card";

type Memo = Awaited<ReturnType<typeof listMemosFn>>[number];

function MemoList({
	memos,
	userId,
	showVisibility = true,
}: {
	memos: Memo[];
	userId?: string | null;
	showVisibility?: boolean;
}) {
	if (!memos.length) {
		return (
			<div className="rounded-md border border-dashed px-3 py-8 text-center text-muted-foreground text-xs">
				没有找到数据
			</div>
		);
	}

	return (
		<>
			<div className="space-y-3">
				{memos.map((memo) => (
					<MemoCard
						key={memo.uid}
						memo={memo}
						userId={userId}
						showVisibility={showVisibility}
					/>
				))}
			</div>
			<Button
				variant="ghost"
				size="sm"
				onClick={() =>
					document
						.querySelector('[data-slot="sidebar-inset"]')
						?.scrollTo({ top: 0, behavior: "smooth" })
				}
				className="mx-auto mt-8 mb-8 flex"
			>
				<ArrowUpIcon className="size-3.5" />
				Back to Top
			</Button>
		</>
	);
}

export { MemoList };
