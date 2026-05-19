import { Button } from "@memos/ui/components/button";
import { Input } from "@memos/ui/components/input";
import { Label } from "@memos/ui/components/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@memos/ui/components/popover";
import { format } from "date-fns";
import { ClockIcon } from "lucide-react";
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

	const dateValue = format(selectedDate, "yyyy-MM-dd");
	const timeLabel = format(selectedDate, "yyyy-MM-dd HH:mm:ss");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button
						variant="ghost"
						size="sm"
						className="mb-2 h-auto px-2 py-1 font-mono text-muted-foreground text-xs hover:text-foreground"
					>
						<ClockIcon className="mr-1 size-3" />
						{timeLabel}
					</Button>
				}
			/>
			<PopoverContent className="w-auto p-3" align="start">
				<div className="flex flex-col gap-3">
					<div className="grid gap-1">
						<Label htmlFor="memo-date" className="text-xs">
							Date
						</Label>
						<Input
							id="memo-date"
							type="date"
							value={dateValue}
							onChange={handleDateChange}
							className="w-full"
						/>
					</div>
					<div className="flex items-end gap-2">
						<div className="grid gap-1 text-center">
							<Label htmlFor="hours" className="text-xs">
								Hours
							</Label>
							<TimePickerInput
								picker="hours"
								date={selectedDate}
								setDate={setSelectedDate}
							/>
						</div>
						<span className="pb-2 text-muted-foreground text-sm">:</span>
						<div className="grid gap-1 text-center">
							<Label htmlFor="minutes" className="text-xs">
								Minutes
							</Label>
							<TimePickerInput
								picker="minutes"
								date={selectedDate}
								setDate={setSelectedDate}
							/>
						</div>
						<span className="pb-2 text-muted-foreground text-sm">:</span>
						<div className="grid gap-1 text-center">
							<Label htmlFor="seconds" className="text-xs">
								Seconds
							</Label>
							<TimePickerInput
								picker="seconds"
								date={selectedDate}
								setDate={setSelectedDate}
							/>
						</div>
						<ClockIcon className="mb-2 size-4 text-muted-foreground" />
					</div>
					<Button size="sm" onClick={handleConfirm}>
						Confirm
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
