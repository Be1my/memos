import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_memos/attachments")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_protected/attachments"!</div>;
}
