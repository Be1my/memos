import { VISIBILITY_VALUES } from "@memos/db/schema/enums";
import { z } from "zod";
import { FileSchema } from "@/lib/schemas/file";

export type { FileData } from "@/lib/schemas/file";
export { FileSchema };

export const CreateMemoInputSchema = z.object({
	content: z.string().trim().min(1),
	payload: z.record(z.string(), z.unknown()).optional(),
	visibility: z.enum(VISIBILITY_VALUES),
	tags: z.array(z.string()).optional(),
	files: z.array(FileSchema).optional().default([]),
	createdAt: z
		.string()
		.optional()
		.refine((s) => s === undefined || !Number.isNaN(Date.parse(s)), {
			message: "Invalid date format",
		}),
});
