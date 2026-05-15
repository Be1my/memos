import { createFileRoute, redirect } from "@tanstack/react-router";
import SignInForm from "@/features/auth/components/sign-in-form";
import { firstUserQueryOptions } from "@/features/auth/queries/auth.query";

export const Route = createFileRoute("/_auth/sign-in")({
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
	return <SignInForm />;
}
