import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@memos/ui/components/tooltip";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { useClockStore } from "@/features/memos/stores/clock";

function toDeltaSeconds(isoString: string, now: number) {
	const date = new Date(isoString);
	return Math.floor((now - date.getTime()) / 1000);
}

function formatRelative(isoString: string, now: number) {
	const delta = toDeltaSeconds(isoString, now);

	if (delta < 60) {
		return m.time_now();
	}

	if (delta < 3600) {
		return m.time_minutes_ago({ minutes: -Math.floor(delta / 60) });
	}

	if (delta < 86400) {
		return m.time_hours_ago({ hours: -Math.floor(delta / 3600) });
	}

	return m.time_date({ date: new Date(isoString) });
}

function MemoTimeDisplay({
	createdAt,
	updatedAt,
}: {
	createdAt: string;
	updatedAt: string;
}) {
	const tick = useClockStore((s) => s.tick);
	const now = tick || Date.now();

	const isUpdated = createdAt !== updatedAt;
	const timeText = formatRelative(updatedAt, now);

	const locale = getLocale();
	const createdFormatted = new Date(createdAt).toLocaleString(locale);
	const updatedFormatted = new Date(updatedAt).toLocaleString(locale);

	const label = isUpdated ? m.time_last_updated({ time: timeText }) : timeText;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger render={<span />}>{label}</TooltipTrigger>
				<TooltipContent side="top" align="center">
					{m.time_created_tooltip({ time: createdFormatted })}
					{isUpdated && (
						<>
							<br />
							{m.time_updated_tooltip({ time: updatedFormatted })}
						</>
					)}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export { MemoTimeDisplay };
