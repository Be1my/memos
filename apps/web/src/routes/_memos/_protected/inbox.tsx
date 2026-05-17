import { SidebarInset } from "@memos/ui/components/sidebar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_memos/_protected/inbox")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SidebarInset className="overflow-y-auto">
			<div className="mx-auto w-full max-w-2xl px-4 pt-8">
				<div>Hello "/_memos/_protected/inbox"!</div>
			</div>
		</SidebarInset>
	);
}
