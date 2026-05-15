import { SidebarInset, SidebarProvider } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { getSessionFn } from "@/functions/get-session";

const protectedPaths = ["/home", "/inbox", "/attachments", "/archived", "/settings"];

export const Route = createFileRoute("/_memos")({
	beforeLoad: async ({ location }) => {
		const session = await getSessionFn();
		if (!session && protectedPaths.includes(location.pathname)) {
			throw redirect({ to: "/sign-in" });
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
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
