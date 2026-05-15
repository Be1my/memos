import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { createAuth } from "@memos/auth";

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
	const headers = getRequestHeaders();
	const session = await createAuth().api.getSession({ headers });
	return session;
});
