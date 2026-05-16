import { Tooltip, TooltipContent, TooltipTrigger } from "@memos/ui/components/tooltip";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = [
	"1月", "2月", "3月", "4月", "5月", "6月",
	"7月", "8月", "9月", "10月", "11月", "12月",
];

function getDayKey(year: number, month: number, day: number): string {
	return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

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
	const now = new Date();
	const [currentMonth, setCurrentMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
	const [yearView, setYearView] = useState(false);

	const heatmap = useMemo(() => {
		const map = new Map<string, number>();
		for (const ts of timestamps) {
			const d = new Date(ts);
			const key = getDayKey(d.getFullYear(), d.getMonth(), d.getDate());
			map.set(key, (map.get(key) ?? 0) + 1);
		}
		return map;
	}, [timestamps]);

	const year = currentMonth.getFullYear();
	const month = currentMonth.getMonth();

	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const firstDayOfWeek = new Date(year, month, 1).getDay();
	const maxCount = Math.max(...Array.from(heatmap.values()), 1);

	const goToPrevMonth = useCallback(() => {
		setCurrentMonth(new Date(year, month - 1, 1));
	}, [year, month]);

	const goToNextMonth = useCallback(() => {
		setCurrentMonth(new Date(year, month + 1, 1));
	}, [year, month]);

	const handleDayClick = useCallback(
		(day: number) => {
			const dateKey = getDayKey(year, month, day);
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

	const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

	const totalCells = 35;
	const cells: React.ReactNode[] = [];
	const prevMonthDays = new Date(year, month, 0).getDate();

	for (let i = firstDayOfWeek - 1; i >= 0; i--) {
		const d = prevMonthDays - i;
		const date = new Date(year, month - 1, d);
		const key = getDayKey(date.getFullYear(), date.getMonth(), date.getDate());
		const count = heatmap.get(key) ?? 0;
		cells.push(
			<div
				key={`prev-${d}`}
				className={`flex items-center justify-center aspect-square w-full rounded-sm text-[10px] font-medium text-muted-foreground/30 ${getHeatColor(count, maxCount)}`}
			>
				{d}
			</div>,
		);
	}
	for (let day = 1; day <= daysInMonth; day++) {
		const key = getDayKey(year, month, day);
		const count = heatmap.get(key) ?? 0;
		const isToday = isCurrentMonth && day === now.getDate();

		cells.push(
			<Tooltip key={key}>
				<TooltipTrigger render={
					<button
						type="button"
						onClick={() => handleDayClick(day)}
						className={`cursor-pointer aspect-square w-full rounded-sm text-[10px] font-medium transition-colors ${getHeatColor(count, maxCount)} ${isToday
								? "ring-1 ring-muted-foreground/50"
								: ""
							} ${count === 0
								? "hover:bg-primary/[0.08]"
								: ""
							}`}
					>
						{day}
					</button>
				} />
				<TooltipContent side="top" align="center">
					{key} · {count} 条
				</TooltipContent>
			</Tooltip>,
		);
	}
	for (let d = 1; cells.length < totalCells; d++) {
		const date = new Date(year, month + 1, d);
		const key = getDayKey(date.getFullYear(), date.getMonth(), date.getDate());
		const count = heatmap.get(key) ?? 0;
		cells.push(
			<div
				key={`next-${d}`}
				className={`flex items-center justify-center aspect-square w-full rounded-sm text-[10px] font-medium text-muted-foreground/30 ${getHeatColor(count, maxCount)}`}
			>
				{d}
			</div>,
		);
	}

	return (
		<div className="space-y-2">
			{/* Navigation */}
			<div className="flex items-center justify-between">
				<button type="button" onClick={goToPrevMonth} className="p-1 text-muted-foreground hover:text-foreground">
					<ChevronLeftIcon className="size-4" />
				</button>
				<button
					type="button"
					onClick={() => setYearView(!yearView)}
					className="text-xs font-medium hover:text-primary"
				>
					{year} 年 {MONTHS[month]}
					{isCurrentMonth && <span className="ml-1 text-primary">•</span>}
				</button>
				<button type="button" onClick={goToNextMonth} className="p-1 text-muted-foreground hover:text-foreground">
					<ChevronRightIcon className="size-4" />
				</button>
			</div>

			{yearView && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 sm:p-8"
					onClick={() => setYearView(false)}
				>
					<div
						className="flex h-full w-full max-w-5xl flex-col rounded-xl border bg-background p-4 shadow-lg sm:p-6"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mb-4 text-center font-medium text-sm">
							{year}
						</div>
						<div className="grid min-h-0 flex-1 grid-cols-2 gap-4 overflow-auto auto-rows-1fr sm:grid-cols-3 lg:grid-cols-4">
							{MONTHS.map((name, m) => {
								const daysIn = new Date(year, m + 1, 0).getDate();
								const firstDay = new Date(year, m, 1).getDay();
								const isCurMonth = now.getFullYear() === year && now.getMonth() === m;
								const prevDays = new Date(year, m, 0).getDate();

								const miniCells = [];
								for (let i = firstDay - 1; i >= 0; i--) {
									const d = prevDays - i;
									const date = new Date(year, m - 1, d);
									const dateKey = getDayKey(date.getFullYear(), date.getMonth(), date.getDate());
									const count = heatmap.get(dateKey) ?? 0;
									miniCells.push(
										<div
											key={`p-${m}-${d}`}
											className={`flex items-center justify-center aspect-square w-full rounded-sm text-[10px] font-medium text-muted-foreground/30 ${getHeatColor(count, maxCount)}`}
										>
											{d}
										</div>,
									);
								}
								for (let d = 1; d <= daysIn; d++) {
									const dayKey = getDayKey(year, m, d);
									const count = heatmap.get(dayKey) ?? 0;
									miniCells.push(
										<Tooltip key={dayKey}>
											<TooltipTrigger render={
												<button
													type="button"
													onClick={() => {
														navigate({
															to: ".",
															search: (prev: Record<string, unknown>) => ({
																...prev,
																date: prev.date === dayKey ? undefined : dayKey,
																tag: undefined,
															}),
															replace: true,
														});
														setCurrentMonth(new Date(year, m, 1));
														setYearView(false);
													}}
													className={`cursor-pointer aspect-square w-full rounded-sm text-[10px] font-medium transition-colors ${getHeatColor(count, maxCount)} ${isCurMonth && d === now.getDate() ? "ring-1 ring-muted-foreground/50" : ""
														} ${count === 0 ? "hover:bg-primary/[0.08]" : ""}`}
												>
													{d}
												</button>
											} />
											<TooltipContent side="top" align="center">
												{dayKey} · {count} 条
											</TooltipContent>
										</Tooltip>,
									);
								}
								const padToRowEnd = (7 - ((firstDay + daysIn) % 7)) % 7;
								for (let d = 1; d <= padToRowEnd; d++) {
									const date = new Date(year, m + 1, d);
									const dateKey = getDayKey(date.getFullYear(), date.getMonth(), date.getDate());
									const count = heatmap.get(dateKey) ?? 0;
									miniCells.push(
										<div
											key={`n-${m}-${d}`}
											className={`flex items-center justify-center aspect-square w-full rounded-sm text-[10px] font-medium text-muted-foreground/30 ${getHeatColor(count, maxCount)}`}
										>
											{d}
										</div>,
									);
								}
								return (
									<div key={m} className="flex h-full flex-col gap-1 rounded-lg border p-2">
										<div className="text-center text-[10px] font-medium text-muted-foreground sm:text-xs">
											{name}
											{isCurMonth && <span className="ml-0.5 text-primary">•</span>}
										</div>
										<div className="grid grid-cols-7 gap-px text-center text-[10px] text-muted-foreground">
											{WEEKDAYS.map((w) => (
												<div key={w} className="py-0.5">{w}</div>
											))}
										</div>
										<div className="grid grid-cols-7 gap-px">
											{miniCells}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}
			<div className="grid grid-cols-7 gap-px text-center text-[10px] text-muted-foreground">
				{WEEKDAYS.map((w) => (
					<div key={w} className="py-0.5">{w}</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-px">
				{cells}
			</div>
		</div>
	);
}
