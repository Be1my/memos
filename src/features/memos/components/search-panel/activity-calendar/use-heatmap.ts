import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { useMemo } from "react";

export function useHeatmap(
	timestamps: string[],
	timeZone: string,
): Map<string, number> {
	return useMemo(() => {
		const map = new Map<string, number>();
		for (const ts of timestamps) {
			const date = new TZDate(ts, timeZone);
			const key = format(date, "yyyy-MM-dd");
			map.set(key, (map.get(key) ?? 0) + 1);
		}
		return map;
	}, [timestamps, timeZone]);
}
