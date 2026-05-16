import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Editor } from "@/features/editor/components/editor";
import { MemoList } from "@/features/editor/components/memo-list";
import { createMemoFn } from "@/features/editor/functions/create-memo.function";
import { memosQueryOptions } from "@/features/editor/queries/memos.query";

const searchSchema = z.object({
	q: z.string().optional(),
	date: z.string().optional(),
	tag: z.string().optional(),
});

export const Route = createFileRoute("/_memos/home")({
	validateSearch: searchSchema,
	loaderDeps: ({ search: { q, date, tag } }) => ({ q, date, tag }),
	loader: async ({ context: { queryClient }, deps: { q, date, tag } }) => {
		const filter = { q, date, tag };
		const memos = await queryClient.ensureQueryData(memosQueryOptions(filter));
		return { memos, filter };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const [resetKey, setResetKey] = useState(0);
	const queryClient = useQueryClient();
	const { filter } = Route.useLoaderData();
	const { data: memos } = useSuspenseQuery(memosQueryOptions(filter));

	const mutation = useMutation({
		mutationFn: createMemoFn,
		onSuccess: () => {
			toast.success("已保存");
			queryClient.invalidateQueries({ queryKey: ["memos"] });
			queryClient.invalidateQueries({ queryKey: ["memos-stats"] });
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
