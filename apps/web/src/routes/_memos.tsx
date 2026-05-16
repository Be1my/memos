import { SidebarInset, SidebarProvider } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SearchPanel } from "@/components/search-panel/search-panel";
import { memosStatsQueryOptions } from "@/features/memos/queries/memos-stats.query";
import { getSessionFn } from "@/functions/get-session";

export const Route = createFileRoute("/_memos")({
	beforeLoad: async ({ context: { queryClient } }) => {
		const session = await getSessionFn();
		if (session?.user) {
			await queryClient.prefetchQuery(memosStatsQueryOptions());
		}
		return { user: session?.user ?? null };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			<SearchPanel />
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
