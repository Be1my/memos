import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AuthFooter from "@/features/auth/components/auth-footer";
import { sessionQueryOptions } from "@/features/auth/queries/auth.query";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ context }) => {
		const session = await context.queryClient.ensureQueryData(
			sessionQueryOptions(),
		);
		if (session) {
			throw redirect({ to: "/home" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="mx-auto flex min-h-svh w-80 max-w-full flex-col items-center justify-start py-4 sm:py-8">
			<div className="flex w-full grow flex-col items-center justify-center py-4">
				<div className="mb-6 flex w-full flex-row items-center justify-center">
					<img
						className="h-14 w-auto rounded-full shadow"
						src="/logo.webp"
						alt=""
					/>
					<p className="ml-2 text-5xl text-foreground opacity-80">Memos</p>
				</div>

				<Outlet />
			</div>
			<AuthFooter />
		</div>
	);
}
