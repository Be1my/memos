import { queryOptions } from "@tanstack/react-query";
import { getCalendarInfoFn } from "../functions/get-calendar-info";

export const calendarInfoQueryOptions = () =>
	queryOptions({
		queryKey: ["calendar-info"],
		queryFn: () => getCalendarInfoFn(),
		staleTime: 30_000,
	});
