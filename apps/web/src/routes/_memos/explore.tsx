import { SidebarInset } from "@memos/ui/components/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SearchPanel } from "@/components/search-panel/search-panel";
import { listExploreMemosQueryOptions } from "@/features/editor/queries/list-explore-memos.query";
import { MemoList } from "@/features/memos/components/memo-list";

const searchSchema = z.object({
	q: z.string().optional(),
	date: z.string().optional(),
	tag: z.string().optional(),
});

export const Route = createFileRoute("/_memos/explore")({
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
			userId: (user as { id?: string } | null)?.id ?? null,
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
		<>
			<SearchPanel />
			<SidebarInset className="overflow-y-auto">
				<div className="mx-auto w-full max-w-2xl px-4 pt-8">
					<MemoList memos={memos} userId={userId} />
				</div>
			</SidebarInset>
		</>
	);
}
