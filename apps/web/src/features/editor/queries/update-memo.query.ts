import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateMemoFn } from "../functions/update-memo.function";

const visibilityMap: Record<string, string> = {
	private: "PRIVATE",
	workspace: "PROTECTED",
	public: "PUBLIC",
};

interface MemoData {
	uid: string;
	content: string;
	payload: Record<string, unknown>;
	visibility: string;
	createdAt: string;
	updatedAt: string;
	[key: string]: unknown;
}

export function useUpdateMemo() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateMemoFn,
		onMutate: async (variables: {
			data: {
				memoId: string;
				content: string;
				payload: Record<string, unknown>;
				visibility: string;
				createdAt?: string;
			};
		}) => {
			await queryClient.cancelQueries({ queryKey: ["memos"] });

			const previousQueries = queryClient.getQueriesData<Array<MemoData>>({
				queryKey: ["memos"],
			});

			queryClient.setQueriesData<Array<MemoData>>(
				{ queryKey: ["memos"] },
				(old) => {
					if (!old) return old;
					return old.map((memo) => {
						if (memo.uid !== variables.data.memoId) return memo;
						return {
							...memo,
							content: variables.data.content,
							payload: variables.data.payload,
							visibility: visibilityMap[variables.data.visibility] ?? variables.data.visibility,
							createdAt: variables.data.createdAt ?? memo.createdAt,
							updatedAt: new Date().toISOString(),
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
			console.error("Update memo error:", error);
			toast.error(error instanceof Error ? error.message : "操作失败");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["memos"] });
		},
	});
}
