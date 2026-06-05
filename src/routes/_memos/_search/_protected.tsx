import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/features/auth/queries/auth.query";

export const Route = createFileRoute("/_memos/_search/_protected")({
	beforeLoad: async ({ context: { queryClient } }) => {
		const { session } = await queryClient.ensureQueryData(sessionQueryOptions());
		if (!session) {
			throw redirect({ to: "/sign-in" });
		}
	},
	component: () => <Outlet />,
});
