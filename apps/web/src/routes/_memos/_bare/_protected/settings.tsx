import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/features/settings/components/settings-view";

export const Route = createFileRoute("/_memos/_bare/_protected/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="mx-auto w-full max-w-3xl px-4 pt-8">
			<SettingsView />
		</div>
	);
}
