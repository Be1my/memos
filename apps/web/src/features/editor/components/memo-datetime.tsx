import { Button } from "@memos/ui/components/button";
import { Input } from "@memos/ui/components/input";
import { Label } from "@memos/ui/components/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@memos/ui/components/popover";
import { format } from "date-fns";
import { ClockIcon, PencilIcon } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { TimePickerInput } from "./time-picker-input";

interface MemoDatetimeProps {
	onChange: (isoString: string | null) => void;
	dateSearch: { date?: string };
}

export function MemoDatetime({ onChange, dateSearch }: MemoDatetimeProps) {
	const dateStr = dateSearch.date;
	const [open, setOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	useEffect(() => {
		if (!dateStr) {
			setSelectedDate(null);
			onChange(null);
			return;
		}
		const now = new Date();
		const [y, m, d] = dateStr.split("-").map(Number);
		const date = new Date(
			y,
			m - 1,
			d,
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
		);
		setSelectedDate(date);
		onChange(date.toISOString());
	}, [dateStr, onChange]);

	const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.value || !selectedDate) return;
		const [y, m, d] = e.target.value.split("-").map(Number);
		const newDate = new Date(selectedDate);
		newDate.setFullYear(y, m - 1, d);
		setSelectedDate(newDate);
	};

	const handleConfirm = () => {
		if (selectedDate) {
			onChange(selectedDate.toISOString());
		}
		setOpen(false);
	};

	if (!dateStr || !selectedDate) return null;

	const dateDots = format(selectedDate, "yyyy.MM.dd");
	const timeDisplay = format(selectedDate, "HH:mm");
	const seconds = format(selectedDate, "ss");
	const dateValue = format(selectedDate, "yyyy-MM-dd");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<button
						type="button"
						className="group mb-3 flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/50 bg-gradient-to-b from-card to-muted/50 px-3.5 py-2 text-left text-xs shadow-xs ring-1 ring-foreground/5 transition-all duration-200 hover:border-border/80 hover:shadow-sm hover:ring-foreground/10 active:scale-[0.98]"
					>
						<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
							<ClockIcon className="size-3" />
						</span>
						<span className="flex items-baseline gap-2">
							<span className="font-medium text-muted-foreground text-xs tracking-[0.08em]">
								{dateDots}
							</span>
							<span className="font-mono font-semibold text-foreground text-sm leading-none tracking-[0.04em]">
								{timeDisplay}
							</span>
							<span className="font-medium font-mono text-[11px] text-muted-foreground/60 leading-none">
								{seconds}
							</span>
						</span>
						<span className="ml-auto flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground/30 opacity-0 transition-all duration-200 group-hover:text-muted-foreground/60 group-hover:opacity-100">
							<PencilIcon className="size-3" />
						</span>
					</button>
				}
			/>
			<PopoverContent className="w-64 p-4" align="start" sideOffset={8}>
				<div className="flex flex-col gap-4">
					<div className="grid gap-1.5">
						<Label
							htmlFor="memo-date"
							className="font-medium text-muted-foreground text-xs uppercase tracking-wide"
						>
							Date
						</Label>
						<Input
							id="memo-date"
							type="date"
							value={dateValue}
							onChange={handleDateChange}
						/>
					</div>
					<div className="grid gap-1.5">
						<Label className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Time
						</Label>
						<div className="flex items-end justify-center gap-1 rounded-lg bg-muted/50 px-3 py-2.5">
							<div className="grid gap-0.5 text-center">
								<span className="font-medium text-[10px] text-muted-foreground/50 uppercase tracking-wider">
									H
								</span>
								<TimePickerInput
									picker="hours"
									date={selectedDate}
									setDate={setSelectedDate}
								/>
							</div>
							<span className="pb-2 font-light text-lg text-muted-foreground/40">
								:
							</span>
							<div className="grid gap-0.5 text-center">
								<span className="font-medium text-[10px] text-muted-foreground/50 uppercase tracking-wider">
									M
								</span>
								<TimePickerInput
									picker="minutes"
									date={selectedDate}
									setDate={setSelectedDate}
								/>
							</div>
							<span className="pb-2 font-light text-lg text-muted-foreground/40">
								:
							</span>
							<div className="grid gap-0.5 text-center">
								<span className="font-medium text-[10px] text-muted-foreground/50 uppercase tracking-wider">
									S
								</span>
								<TimePickerInput
									picker="seconds"
									date={selectedDate}
									setDate={setSelectedDate}
								/>
							</div>
						</div>
					</div>
					<Button size="sm" onClick={handleConfirm} className="w-full">
						Apply
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
