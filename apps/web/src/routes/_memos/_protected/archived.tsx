import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_memos/_protected/archived")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_memos/_protected/archived"!</div>;
}
