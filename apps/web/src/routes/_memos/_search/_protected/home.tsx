import type { JsonObject } from "@memos/db/schema/memo.table";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ActiveFilters } from "@/components/active-filters";
import { createMemoFn } from "@/features/memos/functions/create-memo.function";
import { memosQueryOptions } from "@/features/memos/queries/memos.query";

const Editor = lazy(
	() =>
		import("@/features/memos/editor/components/editor").then((m) => ({
			default: m.Editor,
		})),
);

const MemoList = lazy(
	() =>
		import("@/features/memos/components/memo-list").then((m) => ({
			default: m.MemoList,
		})),
);

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
			userId: user?.id ?? null,
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
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-8">
			<Suspense>
				<Editor
					key={resetKey}
					isSaving={mutation.isPending}
					onSave={(data) =>
						mutation.mutate({
							data: {
								...data,
								payload: data.payload as unknown as JsonObject,
							},
						})
					}
					dateSearch={{ date: filter.date }}
				/>
			</Suspense>
			<ActiveFilters />
			<Suspense>
				<MemoList memos={memos} userId={userId} showVisibility={false} />
			</Suspense>
		</div>
	);
}
