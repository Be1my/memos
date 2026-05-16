import { queryOptions } from "@tanstack/react-query";
import { listMemosFn } from "../functions/list-memos.function";

export const memosQueryOptions = () =>
	queryOptions({
		queryKey: ["memos"],
		queryFn: () => listMemosFn(),
	});
