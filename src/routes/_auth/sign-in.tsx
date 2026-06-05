import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const SignInForm = lazy(() =>
	import("@/features/auth").then((m) => ({ default: m.SignInForm })),
);

export const Route = createFileRoute("/_auth/sign-in")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-[400px] w-full items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			}
		>
			<SignInForm />
		</Suspense>
	);
}
