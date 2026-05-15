import { createAuth } from "@memos/auth";
import { createDb } from "@memos/db";
import * as schema from "@memos/db/schema/auth.table";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getIsFirstUserFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const db = createDb();
		const count = await db.$count(schema.user);
		return { isFirstUser: count === 0 };
	},
);

export const getSessionFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const headers = getRequestHeaders();
		const session = await createAuth().api.getSession({
			headers,
		});

		return session;
	},
);
