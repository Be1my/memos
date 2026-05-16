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

	const goToMonth = useCallback((m: number) => {
		setCurrentMonth(new Date(year, m, 1));
		setYearView(false);
	}, [year]);

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

	const cells: React.ReactNode[] = [];
	for (let i = 0; i < firstDayOfWeek; i++) {
		cells.push(<div key={`empty-${i}`} />);
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
						className={`cursor-pointer aspect-square w-full rounded-sm text-[10px] font-medium transition-colors ${getHeatColor(count, maxCount)} ${
							isToday
								? "ring-1 ring-muted-foreground/50"
								: ""
						} ${
							count === 0
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

			{yearView ? (
				/* Year view */
				<div className="grid grid-cols-3 gap-1">
					{MONTHS.map((name, m) => {
						const isSelectedMonth = m === month;
						const isCurMonth = now.getFullYear() === year && now.getMonth() === m;
						return (
							<button
								key={m}
								type="button"
								onClick={() => goToMonth(m)}
								className={`rounded-md py-2 text-xs font-medium transition-colors ${
									isSelectedMonth
										? "bg-primary text-primary-foreground"
										: "hover:bg-accent"
								}`}
							>
								{name}
								{isCurMonth && <span className="ml-0.5">•</span>}
							</button>
						);
					})}
				</div>
			) : (
				<>
					{/* Weekday headers */}
					<div className="grid grid-cols-7 gap-px text-center text-[10px] text-muted-foreground">
						{WEEKDAYS.map((w) => (
							<div key={w} className="py-0.5">{w}</div>
						))}
					</div>
					{/* Day grid */}
					<div className="grid grid-cols-7 gap-px">
						{cells}
					</div>
				</>
			)}
		</div>
	);
}
