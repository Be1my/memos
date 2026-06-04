import { z } from "zod";

export const TogglePinInputSchema = z.object({
	memoId: z.string().min(1),
});
