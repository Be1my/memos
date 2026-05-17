import { queryOptions } from "@tanstack/react-query";
import { listExploreMemosFn } from "../functions/list-explore-memos.function";
import type { ListMemosFilter } from "../functions/list-memos.shared";

const listExploreMemos = (filter?: ListMemosFilter) =>
	listExploreMemosFn(filter as never);

export const listExploreMemosQueryOptions = (filter?: ListMemosFilter) =>
	queryOptions({
		queryKey: ["explore-memos", filter],
		queryFn: () => listExploreMemos(filter),
	});
