import { SidebarInset } from "@memos/ui/components/sidebar";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SearchPanel } from "@/components/search-panel/search-panel";

export const Route = createFileRoute("/_memos/_search")({
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
