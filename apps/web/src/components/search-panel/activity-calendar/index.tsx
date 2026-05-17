import { Temporal } from "@js-temporal/polyfill";
import { Button } from "@memos/ui/components/button";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { MONTHS } from "./calendar-utils";
import { MonthGrid } from "./month-grid";
import { useHeatmap } from "./use-heatmap";
import { YearView } from "./year-view";

interface ActivityCalendarProps {
	timestamps: string[];
	timeZone: string;
	today: string;
}

export function ActivityCalendar({
	timestamps,
	timeZone,
	today,
}: ActivityCalendarProps) {
	const navigate = useNavigate();
	const now = useMemo(() => Temporal.PlainDate.from(today), [today]);
	const [currentMonth, setCurrentMonth] = useState(
		() => new Temporal.PlainDate(now.year, now.month, 1),
	);
	const [yearView, setYearView] = useState(false);

	const heatmap = useHeatmap(timestamps, timeZone);

	const year = currentMonth.year;
	const month = currentMonth.month;
	const maxCount = Math.max(...Array.from(heatmap.values()), 1);
	const isCurrentMonth = now.year === year && now.month === month;

	const goToPrevMonth = useCallback(() => {
		setCurrentMonth((prev) => prev.subtract({ months: 1 }));
	}, []);

	const goToNextMonth = useCallback(() => {
		setCurrentMonth((prev) => prev.add({ months: 1 }));
	}, []);

	const handleDayClick = useCallback(
		(day: number) => {
			const dateKey = new Temporal.PlainDate(year, month, day).toString();
			navigate({
				to: ".",
				search: (prev: Record<string, unknown>) => ({
					...prev,
					date: prev.date === dateKey ? undefined : dateKey,
					tag: undefined,
				}),
				replace: true,
			});
		},
		[year, month, navigate],
	);

	const handleYearViewDayClick = useCallback(
		(dateKey: string) => {
			const date = Temporal.PlainDate.from(dateKey);
			navigate({
				to: ".",
				search: (prev: Record<string, unknown>) => ({
					...prev,
					date: prev.date === dateKey ? undefined : dateKey,
					tag: undefined,
				}),
				replace: true,
			});
			setCurrentMonth(new Temporal.PlainDate(date.year, date.month, 1));
			setYearView(false);
		},
		[navigate],
	);

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<Button variant="ghost" size="icon" onClick={goToPrevMonth}>
					<ChevronLeftIcon className="size-4" />
				</Button>
				<YearView
					year={year}
					heatmap={heatmap}
					maxCount={maxCount}
					open={yearView}
					onOpenChange={setYearView}
					now={now}
					onDayClick={handleYearViewDayClick}
				>
					<Button variant="ghost" size="sm" className="font-medium text-xs">
						{year} 年 {MONTHS[month - 1]}
						{isCurrentMonth && <span className="ml-1 text-primary">•</span>}
					</Button>
				</YearView>
				<Button variant="ghost" size="icon" onClick={goToNextMonth}>
					<ChevronRightIcon className="size-4" />
				</Button>
			</div>
			<MonthGrid
				year={year}
				month={month}
				heatmap={heatmap}
				maxCount={maxCount}
				now={now}
				onDayClick={handleDayClick}
			/>
		</div>
	);
}
