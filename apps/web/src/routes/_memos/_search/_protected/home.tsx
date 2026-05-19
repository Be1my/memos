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
import { createMemoFn } from "@/features/editor/functions/create-memo.function";
import { memosQueryOptions } from "@/features/editor/queries/memos.query";
import { MemoList } from "@/features/memos/components/memo-list";

const searchSchema = z.object({
	q: z.string().optional(),
	date: z.string().optional(),
	tag: z.string().optional(),
});

export const Route = createFileRoute("/_memos/_search/_protected/home")({
	validateSearch: searchSchema,
	loaderDeps: ({ search: { q, date, tag } }) => ({ q, date, tag }),
	loader: async ({
		context: { queryClient, user },
		deps: { q, date, tag },
	}) => {
		const filter = { q, date, tag };
		const memos = await queryClient.ensureQueryData(memosQueryOptions(filter));
		return {
			memos,
			filter,
			userId: (user as { id?: string } | null)?.id ?? null,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const [resetKey, setResetKey] = useState(0);
	const queryClient = useQueryClient();
	const { filter, userId } = Route.useLoaderData();
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
				dateSearch={{ date: filter.date }}
			/>
			<MemoList memos={memos} userId={userId} />
		</div>
	);
}
