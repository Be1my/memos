import { SidebarProvider } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { sessionQueryOptions } from "@/features/auth/queries/auth.query";

export const Route = createFileRoute("/_memos")({
	beforeLoad: async ({ context: { queryClient } }) => {
		const session = await queryClient.ensureQueryData(sessionQueryOptions());
		return {
			user: session?.user,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	return (
		<SidebarProvider className="h-svh">
			<AppSidebar user={user} />
			<Outlet />
		</SidebarProvider>
	);
}
