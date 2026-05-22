import { SidebarInset } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { calendarInfoQueryOptions } from "@/features/memos/queries/calendar-info.query";
import { memosStatsQueryOptions } from "@/features/memos/queries/memos-stats.query";

const SearchPanel = lazy(
	() =>
		import("@/features/memos/components/search-panel/search-panel").then(
			(m) => ({ default: m.SearchPanel }),
		),
);

export const Route = createFileRoute("/_memos/_search")({
	loader: async ({ context: { queryClient } }) => {
		await queryClient.ensureQueryData(calendarInfoQueryOptions());
		await queryClient.ensureQueryData(memosStatsQueryOptions());
	},

	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Suspense>
				<SearchPanel />
			</Suspense>
			<SidebarInset className="overflow-y-auto">
				<Outlet />
			</SidebarInset>
		</>
	);
}
