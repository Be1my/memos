import { z } from "zod";

export const UpdateMemoInputSchema = z.object({
	memoId: z.string().min(1),
	content: z.string().trim().min(1),
	payload: z.record(z.string(), z.unknown()).optional(),
	visibility: z.string(),
	createdAt: z.string().optional(),
});
