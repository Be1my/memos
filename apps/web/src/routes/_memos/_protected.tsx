import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_memos/_protected")({
	beforeLoad: async ({ context }) => {
		const { user } = context as { user?: unknown };
		if (!user) {
			throw redirect({ to: "/sign-in" });
		}
	},
	component: () => <Outlet />,
});
