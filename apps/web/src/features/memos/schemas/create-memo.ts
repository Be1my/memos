import { VISIBILITY_VALUES } from "@memos/db/schema/enums";
import { FileSchema } from "@/lib/schemas/file";
import { z } from "zod";

export { FileSchema };
export type { FileData } from "@/lib/schemas/file";

export const CreateMemoInputSchema = z.object({
	content: z.string().trim().min(1),
	payload: z.record(z.string(), z.unknown()).optional(),
	visibility: z.enum(VISIBILITY_VALUES),
	tags: z.array(z.string()).optional(),
	files: z.array(FileSchema).optional().default([]),
	createdAt: z
		.string()
		.optional()
		.refine((s) => s === undefined || !isNaN(Date.parse(s)), {
			message: "Invalid date format",
		}),
});
