import { queryOptions } from "@tanstack/react-query";
import {
	type ListMemosFilter,
	listMemosFn,
} from "../functions/list-memos.function";

const listMemos = (filter?: ListMemosFilter) =>
	listMemosFn({ data: filter } as never);

export const memosQueryOptions = (filter?: ListMemosFilter) =>
	queryOptions({
		queryKey: ["memos", filter],
		queryFn: () => listMemos(filter),
	});
