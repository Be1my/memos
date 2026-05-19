import { queryOptions } from "@tanstack/react-query";
import { getIsFirstUserFn, getSessionFn } from "../functions/auth.function";

export const firstUserQueryOptions = () =>
	queryOptions({
		queryKey: ["first-user"],
		queryFn: () => getIsFirstUserFn(),
	});

export const sessionQueryOptions = () =>
	queryOptions({
		queryKey: ["session"],
		queryFn: () => getSessionFn(),
	});