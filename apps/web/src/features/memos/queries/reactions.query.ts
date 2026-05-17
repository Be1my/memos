import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleReactionFn } from "../functions/toggle-reaction.function";

export interface ReactionUser {
	id: number;
	creatorId: string;
	creatorName: string;
	reactionType: string;
}

export function useToggleReaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: toggleReactionFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["memos"] });
		},
		onError: (error) => {
			console.error("Toggle reaction error:", error);
			toast.error(error instanceof Error ? error.message : "操作失败");
		},
	});
}
