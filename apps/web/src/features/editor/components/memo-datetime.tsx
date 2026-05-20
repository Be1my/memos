import { Button } from "@memos/ui/components/button";
import { Label } from "@memos/ui/components/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@memos/ui/components/popover";
import { ClientOnly } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarDays, CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { TimePickerInput } from "./time-picker-input";

interface MemoDatetimeProps {
	onChange: (isoString: string | null) => void;
	dateSearch?: { date?: string };
	defaultDate?: string;
}

export function MemoDatetime({
	onChange,
	dateSearch,
	defaultDate,
}: MemoDatetimeProps) {
	const [open, setOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
		if (dateSearch?.date) {
			const [y, m, d] = dateSearch.date.split("-").map(Number);
			return new Date(y, m - 1, d, 0, 0, 0);
		}
		if (defaultDate) {
			return new Date(defaultDate);
		}
		return null;
	});

	useEffect(() => {
		if (dateSearch?.date) {
			const now = new Date();
			const [y, m, d] = dateSearch.date.split("-").map(Number);
			const date = new Date(
				y,
				m - 1,
				d,
				now.getHours(),
				now.getMinutes(),
				now.getSeconds(),
			);
			if (isNaN(date.getTime())) return;
			setSelectedDate(date);
			onChange(date.toISOString());
		} else if (defaultDate) {
			const date = new Date(defaultDate);
			if (isNaN(date.getTime())) return;
			setSelectedDate(date);
			onChange(date.toISOString());
		} else {
			setSelectedDate(null);
			onChange(null);
		}
	}, [dateSearch?.date, defaultDate, onChange]);

	const handleConfirm = () => {
		if (selectedDate) {
			onChange(selectedDate.toISOString());
		}
		setOpen(false);
	};

	const show = dateSearch?.date ?? defaultDate;
	if (!show || !selectedDate) return null;

	const dateDots = format(selectedDate, "yyyy.MM.dd");
	const timeFull = format(selectedDate, "HH:mm:ss");
	const weekday = format(selectedDate, "EEE");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<button
						type="button"
						className="group relative mx-auto -mt-3 mb-2 flex cursor-pointer items-center gap-3 overflow-hidden rounded-full border bg-gradient-to-r from-primary/90 to-primary px-5 py-1.5 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:shadow-xl active:scale-95"
					>
						<CalendarDays className="size-3.5 shrink-0 text-white/80" />
						<span className="flex items-baseline gap-2.5 text-[13px] leading-none">
							<span className="font-medium text-white/90 tracking-[0.06em]">
								{dateDots}
							</span>
							<ClientOnly
								fallback={
									<span className="font-bold font-mono text-sm tracking-[0.05em]">
										--:--:--
									</span>
								}
							>
								<span className="font-bold font-mono text-sm tracking-[0.05em]">
									{timeFull}
								</span>
							</ClientOnly>
						</span>
						<span className="font-medium text-[10px] text-white/40 uppercase tracking-[0.08em]">
							{weekday}
						</span>
					</button>
				}
			/>
			<ClientOnly fallback={null}>
				<PopoverContent className="w-72 p-5" align="center" sideOffset={12}>
					<div
						className="absolute inset-x-0 top-0 h-1 rounded-t-lg"
						style={{
							background:
								"linear-gradient(90deg, transparent 0%, var(--color-primary) 50%, transparent 100%)",
						}}
					/>
					<div className="flex flex-col gap-5 pt-1">
						<div className="grid gap-2">
							<Label className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
								<span className="h-px flex-1 bg-border/50" />
								Time
								<span className="h-px flex-1 bg-border/50" />
							</Label>
							<div className="flex items-center justify-center gap-2 rounded-xl bg-muted/60 px-4 py-3 ring-1 ring-border/50">
								<div className="grid gap-0.5 text-center">
									<span className="font-semibold text-[9px] text-muted-foreground/40 uppercase tracking-[0.15em]">
										HH
									</span>
									<TimePickerInput
										picker="hours"
										date={selectedDate}
										setDate={setSelectedDate}
									/>
								</div>
								<span className="mt-5 self-start font-thin text-muted-foreground/30 text-xl">
									:
								</span>
								<div className="grid gap-0.5 text-center">
									<span className="font-semibold text-[9px] text-muted-foreground/40 uppercase tracking-[0.15em]">
										MM
									</span>
									<TimePickerInput
										picker="minutes"
										date={selectedDate}
										setDate={setSelectedDate}
									/>
								</div>
								<span className="mt-5 self-start font-thin text-muted-foreground/30 text-xl">
									:
								</span>
								<div className="grid gap-0.5 text-center">
									<span className="font-semibold text-[9px] text-muted-foreground/40 uppercase tracking-[0.15em]">
										SS
									</span>
									<TimePickerInput
										picker="seconds"
										date={selectedDate}
										setDate={setSelectedDate}
									/>
								</div>
							</div>
						</div>
						<Button
							size="sm"
							onClick={handleConfirm}
							className="w-full gap-2 bg-primary text-primary-foreground shadow-sm transition-all hover:shadow-md"
						>
							<CheckIcon className="size-3.5" />
							Apply
						</Button>
					</div>
				</PopoverContent>
			</ClientOnly>
		</Popover>
	);
}
