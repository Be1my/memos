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
		queryFn: () => listReactionsFn({ data: { contentId } } as never),
	});

import { toast } from "sonner";

export function useToggleReaction(contentId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: toggleReactionFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reactions", contentId] });
		},
		onError: (error) => {
			console.error("Toggle reaction error:", error);
			toast.error(error instanceof Error ? error.message : "操作失败");
		},
	});
}

export type { ReactionUser };
