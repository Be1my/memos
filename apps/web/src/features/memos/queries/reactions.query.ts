import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	listReactionsFn,
	type ReactionUser,
} from "../functions/list-reactions.function";
import { toggleReactionFn } from "../functions/toggle-reaction.function";

export const reactionsQueryOptions = (contentId: string) =>
	queryOptions({
		queryKey: ["reactions", contentId],
		queryFn: () => listReactionsFn({ contentId } as never),
	});

export function useToggleReaction(contentId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: toggleReactionFn,
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["reactions", contentId] });
		},
	});
}

export type { ReactionUser };
