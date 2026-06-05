import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const SettingsView = lazy(() =>
	import("@/features/settings").then((m) => ({
		default: m.SettingsView,
	})),
);

export const Route = createFileRoute("/_memos/_bare/_protected/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="mx-auto w-full max-w-3xl px-4 pt-8">
			<Suspense
				fallback={
					<div className="min-h-[400px] w-full rounded-lg border border-border bg-muted/20 animate-pulse" />
				}
			>
				<SettingsView />
			</Suspense>
		</div>
	);
}
