import { SidebarSeparator } from "@/components/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "@/features/auth/queries/auth.query";
import { memosStatsQueryOptions } from "../../queries/memos-stats.query";
import { ActivityCalendar } from "./activity-calendar";
import { SearchBox } from "./search-box";
import { Tags } from "./tags";

export function SearchPanel() {
	const { data: session, isLoading } = useSuspenseQuery(sessionQueryOptions());

	if (isLoading) {
		return (
			<div className="flex w-64 shrink-0 flex-col gap-4 overflow-hidden border-r p-3">
				<div className="h-10 w-full animate-pulse rounded bg-muted" />
				<SidebarSeparator className="mx-0" />
				<div className="space-y-1">
					<div className="h-4 w-20 animate-pulse rounded bg-muted" />
					<div className="h-24 w-full animate-pulse rounded bg-muted" />
				</div>
			</div>
		);
	}

	if (!session?.user) {
		return null;
	}

	const { data: stats } = useSuspenseQuery(memosStatsQueryOptions());
	const timestamps = stats?.timestamps ?? [];
	const tags = stats?.tags ?? [];

	return (
		<div className="flex w-64 shrink-0 flex-col gap-4 overflow-hidden border-r p-3">
			<SearchBox />
			<SidebarSeparator className="mx-0" />
			<div className="space-y-1">
				<h3 className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
					活动日历
				</h3>
				<ActivityCalendar timestamps={timestamps} />
			</div>
			<SidebarSeparator className="mx-0" />
			<div className="space-y-1">
				<h3 className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
					标签
				</h3>
				<Tags tags={tags} />
			</div>
		</div>
	);
}
