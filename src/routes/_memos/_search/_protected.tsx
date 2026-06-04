import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_memos/_search/_protected")({
	beforeLoad: async ({ context }) => {
		const { user } = context;
		if (!user) {
			throw redirect({ to: "/sign-in" });
		}
	},
	component: () => <Outlet />,
});
