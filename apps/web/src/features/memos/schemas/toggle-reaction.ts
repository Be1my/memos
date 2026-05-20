import { z } from "zod";

export const ToggleReactionInputSchema = z.object({
	contentId: z.string().min(1),
	reactionType: z.string().min(1),
});
