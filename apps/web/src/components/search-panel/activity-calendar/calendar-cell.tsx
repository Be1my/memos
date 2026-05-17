import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@memos/ui/components/tooltip";
import type { ReactNode } from "react";
import { getHeatColor } from "./calendar-utils";

interface CalendarCellProps {
	dateKey: string;
	count: number;
	maxCount: number;
	isToday?: boolean;
	onClick?: () => void;
	children: ReactNode;
}

export function CalendarCell({
	dateKey,
	count,
	maxCount,
	isToday,
	onClick,
	children,
}: CalendarCellProps) {
	const heatClass = getHeatColor(count, maxCount);
	const todayClass = isToday ? "ring-1 ring-muted-foreground/50" : "";
	const hoverClass = count === 0 ? "hover:bg-primary/[0.08]" : "";

	if (onClick) {
		return (
			<Tooltip>
				<TooltipTrigger
					render={
						<button
							type="button"
							onClick={onClick}
							className={`aspect-square w-full cursor-pointer rounded-sm font-medium text-[10px] transition-colors ${heatClass} ${todayClass} ${hoverClass}`}
						>
							{children}
						</button>
					}
				/>
				<TooltipContent side="top" align="center">
					{dateKey} · {count} 条
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<div
			className={`flex aspect-square w-full items-center justify-center rounded-sm font-medium text-[10px] text-muted-foreground/30 ${heatClass}`}
		>
			{children}
		</div>
	);
}
