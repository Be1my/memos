import { SidebarInset, SidebarProvider } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SearchPanel } from "@/components/search-panel/search-panel";
import { memosStatsQueryOptions } from "@/features/memos/queries/memos-stats.query";
import { getSessionFn } from "@/functions/get-session";


const protectedPaths = [
	"/home",
	"/inbox",
	"/attachments",
	"/archived",
	"/settings",
];

export const Route = createFileRoute("/_memos")({
	beforeLoad: async ({ context: { queryClient }, location }) => {
		const session = await getSessionFn();
		if (!session && protectedPaths.includes(location.pathname)) {
			throw redirect({ to: "/sign-in" });
		}
		await queryClient.prefetchQuery(memosStatsQueryOptions());
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
