import { Temporal } from "@js-temporal/polyfill";
import { Button } from "@memos/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@memos/ui/components/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@memos/ui/components/tooltip";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = [
	"1月",
	"2月",
	"3月",
	"4月",
	"5月",
	"6月",
	"7月",
	"8月",
	"9月",
	"10月",
	"11月",
	"12月",
];

function getHeatColor(count: number, max: number): string {
	if (count === 0) return "bg-primary/[0.04]";
	const intensity = Math.min(Math.ceil((count / max) * 5), 5);
	const colors = [
		"",
		"bg-primary/10",
		"bg-primary/25",
		"bg-primary/40",
		"bg-primary/60",
		"bg-primary/80",
	];
	return colors[intensity] ?? colors[5];
}

interface ActivityCalendarProps {
	timestamps: string[];
}

export function ActivityCalendar({ timestamps }: ActivityCalendarProps) {
	const navigate = useNavigate();
	const now = Temporal.Now.plainDateISO();
	const [currentMonth, setCurrentMonth] = useState(
		() => new Temporal.PlainDate(now.year, now.month, 1),
	);
	const [yearView, setYearView] = useState(false);

	const heatmap = useMemo(() => {
		const map = new Map<string, number>();
		const timeZone = Temporal.Now.timeZoneId();
		for (const ts of timestamps) {
			const date = Temporal.Instant.from(ts)
				.toZonedDateTimeISO(timeZone)
				.toPlainDate();
			const key = date.toString();
			map.set(key, (map.get(key) ?? 0) + 1);
		}
		return map;
	}, [timestamps]);

	const year = currentMonth.year;
	const month = currentMonth.month;

	const daysInMonth = currentMonth.daysInMonth;
	const firstDayOfWeek = currentMonth.dayOfWeek % 7;
	const maxCount = Math.max(...Array.from(heatmap.values()), 1);

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

	const isCurrentMonth = now.year === year && now.month === month;

	const totalCells = 35;
	const cells: React.ReactNode[] = [];
	const prevMonth = currentMonth.subtract({ months: 1 });
	const prevMonthDays = prevMonth.daysInMonth;
	const nextMonth = currentMonth.add({ months: 1 });

	for (let i = firstDayOfWeek - 1; i >= 0; i--) {
		const d = prevMonthDays - i;
		const key = new Temporal.PlainDate(
			prevMonth.year,
			prevMonth.month,
			d,
		).toString();
		const count = heatmap.get(key) ?? 0;
		cells.push(
			<div
				key={`prev-${d}`}
				className={`flex aspect-square w-full items-center justify-center rounded-sm font-medium text-[10px] text-muted-foreground/30 ${getHeatColor(count, maxCount)}`}
			>
				{d}
			</div>,
		);
	}
	for (let day = 1; day <= daysInMonth; day++) {
		const key = new Temporal.PlainDate(year, month, day).toString();
		const count = heatmap.get(key) ?? 0;
		const isToday = isCurrentMonth && day === now.day;

		cells.push(
			<Tooltip key={key}>
				<TooltipTrigger
					render={
						<button
							type="button"
							onClick={() => handleDayClick(day)}
							className={`aspect-square w-full cursor-pointer rounded-sm font-medium text-[10px] transition-colors ${getHeatColor(count, maxCount)} ${
								isToday ? "ring-1 ring-muted-foreground/50" : ""
							} ${count === 0 ? "hover:bg-primary/[0.08]" : ""}`}
						>
							{day}
						</button>
					}
				/>
				<TooltipContent side="top" align="center">
					{key} · {count} 条
				</TooltipContent>
			</Tooltip>,
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
			<div
				key={`next-${d}`}
				className={`flex aspect-square w-full items-center justify-center rounded-sm font-medium text-[10px] text-muted-foreground/30 ${getHeatColor(count, maxCount)}`}
			>
				{d}
			</div>,
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<Button variant="ghost" size="icon" onClick={goToPrevMonth}>
					<ChevronLeftIcon className="size-4" />
				</Button>
				<Dialog open={yearView} onOpenChange={setYearView}>
					<DialogTrigger
						render={
							<Button
								variant="ghost"
								size="sm"
								className="font-medium text-xs"
							>
								{year} 年 {MONTHS[month - 1]}
								{isCurrentMonth && <span className="ml-1 text-primary">•</span>}
							</Button>
						}
					/>
					<DialogContent className="max-w-5xl h-[85vh] flex flex-col gap-0 bg-background rounded-xl border p-4 sm:p-6 shadow-lg ring-0 sm:max-w-5xl">
						<div className="mb-4 text-center font-medium text-sm">{year}</div>
						<div className="grid min-h-0 flex-1 auto-rows-1fr grid-cols-2 gap-4 overflow-auto sm:grid-cols-3 lg:grid-cols-4">
							{MONTHS.map((name, m) => {
									const mDate = new Temporal.PlainDate(year, m + 1, 1);
									const daysIn = mDate.daysInMonth;
									const firstDay = mDate.dayOfWeek % 7;
									const isCurMonth = now.year === year && now.month === m + 1;
									const prevMD = mDate.subtract({ months: 1 });
									const prevDays = prevMD.daysInMonth;
									const nextMD = mDate.add({ months: 1 });

									const miniCells = [];
									for (let i = firstDay - 1; i >= 0; i--) {
										const d = prevDays - i;
										const dateKey = new Temporal.PlainDate(
											prevMD.year,
											prevMD.month,
											d,
										).toString();
										const count = heatmap.get(dateKey) ?? 0;
										miniCells.push(
											<div
												key={dateKey}
												className={`flex aspect-square w-full items-center justify-center rounded-sm font-medium text-[10px] text-muted-foreground/30 ${getHeatColor(count, maxCount)}`}
											>
												{d}
											</div>,
										);
									}
									for (let d = 1; d <= daysIn; d++) {
										const dayKey = new Temporal.PlainDate(
											year,
											m + 1,
											d,
										).toString();
										const count = heatmap.get(dayKey) ?? 0;
										miniCells.push(
											<Tooltip key={dayKey}>
												<TooltipTrigger
													render={
														<button
															type="button"
															onClick={() => {
																navigate({
																	to: ".",
																	search: (prev: Record<string, unknown>) => ({
																		...prev,
																		date:
																			prev.date === dayKey ? undefined : dayKey,
																		tag: undefined,
																	}),
																	replace: true,
																});
																setCurrentMonth(
																	new Temporal.PlainDate(year, m + 1, 1),
																);
																setYearView(false);
															}}
															className={`aspect-square w-full cursor-pointer rounded-sm font-medium text-[10px] transition-colors ${getHeatColor(count, maxCount)} ${
																isCurMonth && d === now.day
																	? "ring-1 ring-muted-foreground/50"
																	: ""
															} ${count === 0 ? "hover:bg-primary/[0.08]" : ""}`}
														>
															{d}
														</button>
													}
												/>
												<TooltipContent side="top" align="center">
													{dayKey} · {count} 条
												</TooltipContent>
											</Tooltip>,
										);
									}
									const padToRowEnd = (7 - ((firstDay + daysIn) % 7)) % 7;
									for (let d = 1; d <= padToRowEnd; d++) {
										const dateKey = new Temporal.PlainDate(
											nextMD.year,
											nextMD.month,
											d,
										).toString();
										const count = heatmap.get(dateKey) ?? 0;
										miniCells.push(
											<div
												key={dateKey}
												className={`flex aspect-square w-full items-center justify-center rounded-sm font-medium text-[10px] text-muted-foreground/30 ${getHeatColor(count, maxCount)}`}
											>
												{d}
											</div>,
										);
									}
									return (
										<div
											key={name}
											className="flex h-full flex-col gap-1 rounded-lg border p-2"
										>
											<div className="text-center font-medium text-[10px] text-muted-foreground sm:text-xs">
												{name}
												{isCurMonth && (
													<span className="ml-0.5 text-primary">•</span>
												)}
											</div>
											<div className="grid grid-cols-7 gap-px text-center text-[10px] text-muted-foreground">
												{WEEKDAYS.map((w) => (
													<div key={w} className="py-0.5">
														{w}
													</div>
												))}
											</div>
											<div className="grid grid-cols-7 gap-px">{miniCells}</div>
										</div>
									);
								})}
							</div>
						</DialogContent>
					</Dialog>
					<Button variant="ghost" size="icon" onClick={goToNextMonth}>
						<ChevronRightIcon className="size-4" />
					</Button>
				</div>
			<div className="grid grid-cols-7 gap-px text-center text-[10px] text-muted-foreground">
				{WEEKDAYS.map((w) => (
					<div key={w} className="py-0.5">
						{w}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-px">{cells}</div>
		</div>
	);
}
