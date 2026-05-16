import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_memos/")({
	beforeLoad: async ({ context }) => {
		const { user } = context as { user?: unknown };
		if (user) {
			throw redirect({ to: "/home" });
		}
		throw redirect({ to: "/explore" });
	},
});
