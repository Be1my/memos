import { z } from "zod";

export const FileSchema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	size: z.number().nonnegative(),
	key: z.string().min(1),
});

const visibilityValues = ["private", "workspace", "public"] as const;

export const CreateMemoInputSchema = z.object({
	content: z.string().trim().min(1),
	payload: z.record(z.string(), z.unknown()).optional(),
	visibility: z.enum(visibilityValues),
	tags: z.array(z.string()).optional(),
	files: z.array(FileSchema).optional().default([]),
	createdAt: z
		.string()
		.optional()
		.refine((s) => s === undefined || !isNaN(Date.parse(s)), {
			message: "Invalid date format",
		}),
});
