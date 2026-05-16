import { queryOptions } from "@tanstack/react-query";
import { listMemosFn, type ListMemosFilter } from "../functions/list-memos.function";

const listMemos = (filter?: ListMemosFilter) => listMemosFn(filter as never);

export const memosQueryOptions = (filter?: ListMemosFilter) =>
	queryOptions({
		queryKey: ["memos", filter],
		queryFn: () => listMemos(filter),
	});
