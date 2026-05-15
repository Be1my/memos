import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_memos/u/$username")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_protected/u/$username"!</div>;
}
