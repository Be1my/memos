import { SidebarSeparator } from "@memos/ui/components/sidebar";
import { useQuery } from "@tanstack/react-query";
import { memosStatsQueryOptions } from "@/features/memos/queries/memos-stats.query";
import { ActivityCalendar } from "./activity-calendar";
import { SearchBox } from "./search-box";
import { Tags } from "./tags";

export function SearchPanel() {
	const { data: stats } = useQuery(memosStatsQueryOptions());
	const timestamps = stats?.timestamps ?? [];
	const tags = stats?.tags ?? [];

	return (
		<div className="flex w-64 shrink-0 flex-col gap-4 overflow-auto border-r p-3">
			<SearchBox />
			<SidebarSeparator className="mx-0" />
			<div className="space-y-1">
				<h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
					活动日历
				</h3>
				<ActivityCalendar timestamps={timestamps} />
			</div>
			<SidebarSeparator className="mx-0" />
			<div className="space-y-1">
				<h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
					标签
				</h3>
				<Tags tags={tags} />
			</div>
		</div>
	);
}
