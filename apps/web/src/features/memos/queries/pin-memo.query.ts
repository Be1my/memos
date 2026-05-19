import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { togglePinFn } from "../functions/toggle-pin.function";

interface MemoWithPin {
	uid: string;
	pinned: boolean;
}

export function useTogglePin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: togglePinFn,
		onMutate: async (variables: { data: { memoId: string } }) => {
			await queryClient.cancelQueries({ queryKey: ["memos"] });

			const previousQueries = queryClient.getQueriesData<MemoWithPin[]>({
				queryKey: ["memos"],
			});

			queryClient.setQueriesData<MemoWithPin[]>(
				{ queryKey: ["memos"] },
				(old) => {
					if (!old) return old;
					return old.map((memo) => {
						if (memo.uid !== variables.data.memoId) return memo;
						return { ...memo, pinned: !memo.pinned };
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
			console.error("Toggle pin error:", error);
			toast.error(error instanceof Error ? error.message : "操作失败");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["memos"] });
		},
	});
}
