import { z } from "zod";

export const FileInfoSchema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	size: z.number().nonnegative(),
});

export const FileSchema = FileInfoSchema.extend({
	key: z.string().min(1),
});

export type FileInfo = z.infer<typeof FileInfoSchema>;
export type FileData = z.infer<typeof FileSchema>;
