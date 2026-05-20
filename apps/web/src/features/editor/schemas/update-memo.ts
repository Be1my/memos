import { z } from "zod";

const visibilityValues = ["private", "workspace", "public"] as const;

export const UpdateMemoInputSchema = z.object({
	memoId: z.string().min(1),
	content: z.string().trim().min(1),
	payload: z.record(z.string(), z.unknown()).optional(),
	visibility: z.enum(visibilityValues),
	createdAt: z.string().optional().refine(
		(s) => s === undefined || !isNaN(Date.parse(s)),
		{ message: "Invalid date format" },
	),
});
