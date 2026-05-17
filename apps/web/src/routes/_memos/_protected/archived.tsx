import { SidebarInset } from "@memos/ui/components/sidebar";
import { createFileRoute } from "@tanstack/react-router";
import { SearchPanel } from "@/components/search-panel/search-panel";

export const Route = createFileRoute("/_memos/_protected/archived")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<SearchPanel />
			<SidebarInset className="overflow-y-auto">
				<div className="mx-auto w-full max-w-2xl px-4 pt-8">
					<div>Hello "/_memos/_protected/archived"!</div>
				</div>
			</SidebarInset>
		</>
	);
}
