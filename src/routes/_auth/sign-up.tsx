import { createFileRoute } from "@tanstack/react-router";
import { firstUserQueryOptions } from "@/features/auth";
import SignUpForm from "@/features/auth/components/sign-up-form";

export const Route = createFileRoute("/_auth/sign-up")({
	loader: async ({ context }) => {
		const { isFirstUser } = await context.queryClient.ensureQueryData(
			firstUserQueryOptions(),
		);
		return { isFirstUser };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { isFirstUser } = Route.useLoaderData();
	return <SignUpForm isFirstUser={isFirstUser} />;
}
