import { Temporal } from "@js-temporal/polyfill";
import { CalendarCell } from "./calendar-cell";
import { WEEKDAYS } from "./calendar-utils";

interface MonthGridProps {
	year: number;
	month: number;
	heatmap: Map<string, number>;
	maxCount: number;
	now: Temporal.PlainDate;
	onDayClick?: (day: number) => void;
	showWeekdays?: boolean;
}

export function MonthGrid({
	year,
	month,
	heatmap,
	maxCount,
	now,
	onDayClick,
	showWeekdays = true,
}: MonthGridProps) {
	const currentMonth = new Temporal.PlainDate(year, month, 1);
	const daysInMonth = currentMonth.daysInMonth;
	const firstDayOfWeek = currentMonth.dayOfWeek % 7;
	const isCurrentMonth = now.year === year && now.month === month;

	const prevMonth = currentMonth.subtract({ months: 1 });
	const prevMonthDays = prevMonth.daysInMonth;
	const nextMonth = currentMonth.add({ months: 1 });

	const totalCells = 35;
	const cells: React.ReactNode[] = [];

	for (let i = firstDayOfWeek - 1; i >= 0; i--) {
		const d = prevMonthDays - i;
		const key = new Temporal.PlainDate(
			prevMonth.year,
			prevMonth.month,
			d,
		).toString();
		const count = heatmap.get(key) ?? 0;
		cells.push(
			<CalendarCell
				key={`prev-${d}`}
				dateKey={key}
				count={count}
				maxCount={maxCount}
			>
				{d}
			</CalendarCell>,
		);
	}

	for (let day = 1; day <= daysInMonth; day++) {
		const key = new Temporal.PlainDate(year, month, day).toString();
		const count = heatmap.get(key) ?? 0;
		const isToday = isCurrentMonth && day === now.day;
		cells.push(
			<CalendarCell
				key={key}
				dateKey={key}
				count={count}
				maxCount={maxCount}
				isToday={isToday}
				onClick={onDayClick ? () => onDayClick(day) : undefined}
			>
				{day}
			</CalendarCell>,
		);
	}

	for (let d = 1; cells.length < totalCells; d++) {
		const key = new Temporal.PlainDate(
			nextMonth.year,
			nextMonth.month,
			d,
		).toString();
		const count = heatmap.get(key) ?? 0;
		cells.push(
			<CalendarCell
				key={`next-${d}`}
				dateKey={key}
				count={count}
				maxCount={maxCount}
			>
				{d}
			</CalendarCell>,
		);
	}

	return (
		<>
			{showWeekdays && (
				<div className="grid grid-cols-7 gap-px text-center text-[10px] text-muted-foreground">
					{WEEKDAYS.map((w) => (
						<div key={w} className="py-0.5">
							{w}
						</div>
					))}
				</div>
			)}
			<div className="grid grid-cols-7 gap-px">{cells}</div>
		</>
	);
}
