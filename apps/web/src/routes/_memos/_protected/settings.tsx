import { SidebarInset } from "@memos/ui/components/sidebar";
import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/features/settings/components/settings-view";

export const Route = createFileRoute("/_memos/_protected/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SidebarInset className="overflow-y-auto">
			<div className="mx-auto w-full max-w-3xl px-4 pt-8">
				<SettingsView />
			</div>
		</SidebarInset>
	);
}
