import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleReactionFn } from "../functions/toggle-reaction.function";

export interface ReactionUser {
	id: number;
	creatorId: string;
	creatorName: string;
	reactionType: string;
}

interface MemoWithReactions {
	uid: string;
	reactions: ReactionUser[];
}

export function useToggleReaction(currentUserId?: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: toggleReactionFn,
		onMutate: async (variables: { data: { contentId: string; reactionType: string } }) => {
			await queryClient.cancelQueries({ queryKey: ["memos"] });

			const previousQueries = queryClient.getQueriesData<MemoWithReactions[]>({
				queryKey: ["memos"],
			});

			queryClient.setQueriesData<MemoWithReactions[]>(
				{ queryKey: ["memos"] },
				(old) => {
					if (!old) return old;
					return old.map((memo) => {
						if (memo.uid !== variables.data.contentId) return memo;

						const hasReacted =
							currentUserId &&
							memo.reactions.some(
								(r) =>
									r.creatorId === currentUserId &&
									r.reactionType === variables.data.reactionType,
							);

						if (hasReacted) {
							return {
								...memo,
								reactions: memo.reactions.filter(
									(r) =>
										!(
											r.creatorId === currentUserId &&
											r.reactionType === variables.data.reactionType
										),
								),
							};
						}

						return {
							...memo,
							reactions: [
								...memo.reactions,
								{
									id: Date.now(),
									creatorId: currentUserId ?? "",
									creatorName: "",
									reactionType: variables.data.reactionType,
								},
							],
						};
					});
				},
			);

			return { previousQueries };
		},
		onError: (error, _variables, context) => {
			if (context?.previousQueries) {
				for (const [key, data] of context.previousQueries) {
					queryClient.setQueryData(key, data);
				}
			}
			console.error("Toggle reaction error:", error);
			toast.error(error instanceof Error ? error.message : "操作失败");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["memos"] });
		},
	});
}
