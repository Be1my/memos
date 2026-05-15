import { SidebarInset, SidebarProvider } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { getUser } from "@/functions/get-user";

export const Route = createFileRoute("/_memos")({
	loader: async () => {
		const session = await getUser();
		return { session };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useLoaderData();
	return (
		<SidebarProvider>
			<AppSidebar ssrSession={session} />
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
