import { VISIBILITY_VALUES } from "@memos/db/schema/enums";
import { z } from "zod";

export const UpdateMemoInputSchema = z.object({
	memoId: z.string().min(1),
	content: z.string().trim().min(1),
	payload: z.record(z.string(), z.unknown()).optional(),
	visibility: z.enum(VISIBILITY_VALUES),
	createdAt: z
		.string()
		.optional()
		.refine((s) => s === undefined || !Number.isNaN(Date.parse(s)), {
			message: "Invalid date format",
		}),
});
