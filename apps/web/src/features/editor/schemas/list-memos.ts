import { z } from "zod";

export const ListMemosFilterSchema = z.object({
	q: z.string().optional(),
	date: z.string().optional(),
	tag: z.string().optional(),
});
