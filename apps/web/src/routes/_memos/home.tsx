import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Editor } from "@/features/editor/components/editor";
import { MemoList } from "@/features/editor/components/memo-list";
import { createMemoFn } from "@/features/editor/functions/create-memo.function";
import { memosQueryOptions } from "@/features/editor/queries/memos.query";

export const Route = createFileRoute("/_memos/home")({
	loader: async ({ context: { queryClient } }) => {
		const memos = await queryClient.ensureQueryData(memosQueryOptions());
		return { memos };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const [resetKey, setResetKey] = useState(0);
	const queryClient = useQueryClient();
	const { data: memos } = useSuspenseQuery(memosQueryOptions());

	const mutation = useMutation({
		mutationFn: createMemoFn,
		onSuccess: () => {
			toast.success("已保存");
			queryClient.invalidateQueries({ queryKey: ["memos"] });
			setResetKey((k) => k + 1);
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "保存失败");
		},
	});

	return (
		<div className="mx-auto w-full max-w-2xl px-4 pt-8">
			<Editor
				key={resetKey}
				isSaving={mutation.isPending}
				onSave={(data) => mutation.mutate({ data })}
			/>
			<MemoList memos={memos} />
		</div>
	);
}
