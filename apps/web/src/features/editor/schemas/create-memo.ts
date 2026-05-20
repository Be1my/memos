import { z } from "zod";

export const FileSchema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	size: z.number().nonnegative(),
	base64: z.string().min(1),
});

export const CreateMemoInputSchema = z.object({
	content: z.string().trim().min(1),
	payload: z.record(z.string(), z.unknown()).optional(),
	visibility: z.string(),
	tags: z.array(z.string()).optional(),
	files: z.array(FileSchema).optional().default([]),
	createdAt: z.string().optional(),
});
