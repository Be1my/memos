import { SidebarInset } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_memos/_bare")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SidebarInset className="overflow-y-auto">
			<Outlet />
		</SidebarInset>
	);
}
