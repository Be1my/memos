import { queryOptions } from "@tanstack/react-query";
import { listMemosStatsFn } from "../functions/list-memos-stats.function";

export const memosStatsQueryOptions = () =>
	queryOptions({
		queryKey: ["memos-stats"],
		queryFn: () => listMemosStatsFn(),
		staleTime: 30_000,
	});
