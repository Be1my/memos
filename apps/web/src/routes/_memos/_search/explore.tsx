import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { lazy, Suspense } from "react";
import { ActiveFilters } from "@/components/active-filters";
import { listExploreMemosQueryOptions } from "@/features/memos/queries/list-explore-memos.query";

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

export const Route = createFileRoute("/_memos/_search/explore")({
	validateSearch: searchSchema,
	loaderDeps: ({ search: { q, date, tag } }) => ({ q, date, tag }),
	loader: async ({
		context: { queryClient, user },
		deps: { q, date, tag },
	}) => {
		const filter = { q, date, tag };
		const memos = await queryClient.ensureQueryData(
			listExploreMemosQueryOptions(filter),
		);
		return {
			memos,
			filter,
			userId: user?.id ?? null,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { filter, userId } = Route.useLoaderData();
	const { data: memos } = useSuspenseQuery(
		listExploreMemosQueryOptions(filter),
	);

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-8">
			<ActiveFilters />
			<Suspense>
				<MemoList memos={memos} userId={userId} />
			</Suspense>
		</div>
	);
}
