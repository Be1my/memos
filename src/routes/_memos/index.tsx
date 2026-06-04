import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_memos/")({
	beforeLoad: async ({ context }) => {
		const { user } = context;
		if (user) {
			throw redirect({ to: "/home" });
		}
		throw redirect({ to: "/explore" });
	},
});
