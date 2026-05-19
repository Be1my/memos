import { Button } from "@memos/ui/components/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	addMonths,
	format,
	isSameMonth,
	parse,
	startOfMonth,
	subMonths,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { calendarInfoQueryOptions } from "@/features/memos/queries/calendar-info.query";
import { MONTHS } from "./calendar-utils";
import { MonthGrid } from "./month-grid";
import { useHeatmap } from "./use-heatmap";
import { YearView } from "./year-view";

interface ActivityCalendarProps {
	timestamps: string[];
}

const parseToday = (today: string) => parse(today, "yyyy-MM-dd", new Date());

export function ActivityCalendar({ timestamps }: ActivityCalendarProps) {
	const navigate = useNavigate();
	const {
		data: { timeZone, today },
	} = useSuspenseQuery(calendarInfoQueryOptions());

	const now = useMemo(() => parseToday(today), [today]);
	const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(now));
	const [yearView, setYearView] = useState(false);

	const heatmap = useHeatmap(timestamps, timeZone);

	const year = currentMonth.getFullYear();
	const month = currentMonth.getMonth() + 1;
	const maxCount = Math.max(...Array.from(heatmap.values()), 1);
	const isCurrentMonth = isSameMonth(now, currentMonth);

	const goToPrevMonth = useCallback(() => {
		setCurrentMonth((prev) => subMonths(prev, 1));
	}, []);

	const goToNextMonth = useCallback(() => {
		setCurrentMonth((prev) => addMonths(prev, 1));
	}, []);

	const handleDayClick = useCallback(
		(day: number) => {
			const dateKey = format(new Date(year, month - 1, day), "yyyy-MM-dd");
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
			const date = parseToday(dateKey);
			navigate({
				to: ".",
				search: (prev: Record<string, unknown>) => ({
					...prev,
					date: prev.date === dateKey ? undefined : dateKey,
					tag: undefined,
				}),
				replace: true,
			});
			setCurrentMonth(startOfMonth(date));
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
