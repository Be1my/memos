import { SidebarInset } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SearchPanel, calendarInfoQueryOptions, memosStatsQueryOptions } from "@/features/memos";

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
			<SearchPanel />
			<SidebarInset className="overflow-y-auto">
				<Outlet />
			</SidebarInset>
		</>
	);
}
