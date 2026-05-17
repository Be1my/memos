import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_memos/_bare/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="mx-auto w-full max-w-2xl px-4 pt-8">
			<div>Hello "/_memos/about"!</div>
		</div>
	);
}
