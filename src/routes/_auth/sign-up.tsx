import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { firstUserQueryOptions } from "@/features/auth";

const SignUpForm = lazy(() =>
	import("@/features/auth").then((m) => ({ default: m.SignUpForm })),
);

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
	return (
		<Suspense
			fallback={
				<div className="flex min-h-[400px] w-full items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			}
		>
			<SignUpForm isFirstUser={isFirstUser} />
		</Suspense>
	);
}
