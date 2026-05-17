import { Temporal } from "@js-temporal/polyfill";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@memos/ui/components/dialog";
import type { ReactElement } from "react";
import { MONTHS } from "./calendar-utils";
import { MonthGrid } from "./month-grid";

interface YearViewProps {
	year: number;
	heatmap: Map<string, number>;
	maxCount: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	now: Temporal.PlainDate;
	onDayClick: (dateKey: string) => void;
	children: ReactElement;
}

export function YearView({
	year,
	heatmap,
	maxCount,
	open,
	onOpenChange,
	now,
	onDayClick,
	children,
}: YearViewProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger render={children} />
			<DialogContent className="flex h-[85vh] max-w-5xl flex-col gap-0 rounded-xl border bg-background p-4 shadow-lg ring-0 sm:max-w-5xl sm:p-6">
				<div className="mb-4 text-center font-medium text-sm">{year}</div>
				<div className="grid min-h-0 flex-1 auto-rows-1fr grid-cols-2 gap-4 overflow-auto sm:grid-cols-3 lg:grid-cols-4">
					{MONTHS.map((name, m) => {
						const isCurMonth = now.year === year && now.month === m + 1;
						return (
							<div
								key={name}
								className="flex h-full flex-col gap-1 rounded-lg border p-2"
							>
								<div className="text-center font-medium text-[10px] text-muted-foreground sm:text-xs">
									{name}
									{isCurMonth && <span className="ml-0.5 text-primary">•</span>}
								</div>
								<MonthGrid
									year={year}
									month={m + 1}
									heatmap={heatmap}
									maxCount={maxCount}
									now={now}
									onDayClick={(day) =>
										onDayClick(
											new Temporal.PlainDate(year, m + 1, day).toString(),
										)
									}
								/>
							</div>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}
