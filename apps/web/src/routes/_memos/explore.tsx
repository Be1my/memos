import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_memos/explore")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_public/explore"!</div>;
}
