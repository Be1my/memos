import { SidebarInset, SidebarProvider } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { firstUserQueryOptions } from "@/features/auth/queries/auth.query";

export const Route = createFileRoute("/_memos")({
	beforeLoad: async ({ context }) => {
		const { isFirstUser } =
			await context.queryClient.ensureQueryData(firstUserQueryOptions());
		if (isFirstUser) {
			throw redirect({ to: "/sign-up" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
