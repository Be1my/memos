import { SidebarSeparator } from "@memos/ui/components/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { calendarInfoQueryOptions } from "@/features/memos/queries/calendar-info.query";
import { memosStatsQueryOptions } from "@/features/memos/queries/memos-stats.query";
import { ActivityCalendar } from "./activity-calendar";
import { SearchBox } from "./search-box";
import { Tags } from "./tags";

export function SearchPanel() {
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
				<ActivityCalendar
					timestamps={timestamps}
				/>
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
