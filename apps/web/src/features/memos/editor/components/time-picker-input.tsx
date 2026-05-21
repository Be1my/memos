import { Input } from "@memos/ui/components/input";
import { cn } from "@memos/ui/lib/utils";
import type { KeyboardEvent } from "react";
import { forwardRef, useEffect, useMemo, useState } from "react";
import {
	getArrowByType,
	getDateByType,
	setDateByType,
	type TimePickerType,
} from "./time-picker-utils";

export interface TimePickerInputProps {
	picker: TimePickerType;
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
	onRightFocus?: () => void;
	onLeftFocus?: () => void;
	className?: string;
}

const TimePickerInput = forwardRef<HTMLInputElement, TimePickerInputProps>(
	(
		{
			className,
			date = new Date(new Date().setHours(0, 0, 0, 0)),
			setDate,
			picker,
			onLeftFocus,
			onRightFocus,
		},
		ref,
	) => {
		const [flag, setFlag] = useState(false);

		useEffect(() => {
			if (flag) {
				const timer = setTimeout(() => setFlag(false), 2000);
				return () => clearTimeout(timer);
			}
		}, [flag]);

		const calculatedValue = useMemo(
			() => getDateByType(date, picker),
			[date, picker],
		);

		const calculateNewValue = (key: string) => {
			return !flag ? `0${key}` : calculatedValue.slice(1, 2) + key;
		};

		const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Tab") return;
			e.preventDefault();
			if (e.key === "ArrowRight") onRightFocus?.();
			if (e.key === "ArrowLeft") onLeftFocus?.();
			if (["ArrowUp", "ArrowDown"].includes(e.key)) {
				const step = e.key === "ArrowUp" ? 1 : -1;
				const newValue = getArrowByType(calculatedValue, step, picker);
				if (flag) setFlag(false);
				const tempDate = new Date(date);
				setDate(setDateByType(tempDate, newValue, picker));
			}
			if (e.key >= "0" && e.key <= "9") {
				const newValue = calculateNewValue(e.key);
				if (flag) onRightFocus?.();
				setFlag((prev) => !prev);
				const tempDate = new Date(date);
				setDate(setDateByType(tempDate, newValue, picker));
			}
		};

		return (
			<Input
				ref={ref}
				id={picker}
				name={picker}
				className={cn(
					"w-[48px] text-center font-mono text-base tabular-nums caret-transparent focus:bg-accent focus:text-accent-foreground [&::-webkit-inner-spin-button]:appearance-none",
					className,
				)}
				value={calculatedValue}
				type="tel"
				inputMode="decimal"
				onKeyDown={handleKeyDown}
				onChange={() => {}}
			/>
		);
	},
);

TimePickerInput.displayName = "TimePickerInput";

export { TimePickerInput };
