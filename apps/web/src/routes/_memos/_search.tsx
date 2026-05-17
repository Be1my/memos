import { SidebarInset } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SearchPanel } from "@/components/search-panel/search-panel";
import { getCalendarInfoFn } from "@/functions/get-calendar-info";

export const Route = createFileRoute("/_memos/_search")({
	loader: () => getCalendarInfoFn(),
	component: RouteComponent,
});

function RouteComponent() {
	const { timeZone, today } = Route.useLoaderData();
	return (
		<>
			<SearchPanel timeZone={timeZone} today={today} />
			<SidebarInset className="overflow-y-auto">
				<Outlet />
			</SidebarInset>
		</>
	);
}
