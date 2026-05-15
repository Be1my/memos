import { queryOptions } from "@tanstack/react-query";
import { getIsFirstUserFn } from "../functions/auth.function";

export const firstUserQueryOptions = () =>
	queryOptions({
		queryKey: ["first-user"],
		queryFn: () => getIsFirstUserFn(),
	});
