import { Temporal } from "@js-temporal/polyfill";
import { useMemo } from "react";

export function useHeatmap(timestamps: string[]): Map<string, number> {
	return useMemo(() => {
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
}
