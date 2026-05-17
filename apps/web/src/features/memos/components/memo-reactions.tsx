"use client";

import { Popover } from "@base-ui/react/popover";
import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "@memos/ui/components/emoji-picker";
import { SmilePlusIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ReactionBadge } from "./reaction-badge";
import {
	reactionsQueryOptions,
	useToggleReaction,
	type ReactionUser,
} from "../queries/reactions.query";

function groupReactions(
	reactions: ReactionUser[],
): Map<string, ReactionUser[]> {
	const grouped = new Map<string, ReactionUser[]>();
	for (const r of reactions) {
		const existing = grouped.get(r.reactionType) ?? [];
		existing.push(r);
		grouped.set(r.reactionType, existing);
	}
	return grouped;
}

interface MemoReactionsProps {
	contentId: string;
	currentUserId?: string;
}

function MemoReactions({ contentId, currentUserId }: MemoReactionsProps) {
	const { data: reactions = [] } = useQuery(
		reactionsQueryOptions(contentId),
	);
	const toggleMutation = useToggleReaction(contentId);

	const grouped = groupReactions(reactions);
	const [open, setOpen] = useState(false);

	const handleToggle = (emoji: string) => {
		toggleMutation.mutate({ data: { contentId, reactionType: emoji } });
	};

	const hasReactions = reactions.length > 0;

	if (!currentUserId && !hasReactions) {
		return null;
	}

	return (
		<div className="mt-2 flex items-center gap-1.5">
			{hasReactions && (
				<div className="flex flex-wrap gap-1">
					{Array.from(grouped.entries()).map(([emoji, users]) => (
						<ReactionBadge
							key={emoji}
							emoji={emoji}
							users={users}
							currentUserId={currentUserId}
							onToggle={handleToggle}
						/>
					))}
				</div>
			)}
			{currentUserId && (
				<Popover.Root open={open} onOpenChange={setOpen}>
					<Popover.Trigger
						className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity group-hover/memo:opacity-100 hover:bg-accent hover:text-foreground"
						aria-label="Add reaction"
					>
						<SmilePlusIcon className="size-4" />
					</Popover.Trigger>
					<Popover.Portal>
						<Popover.Positioner side="top" align="end" sideOffset={4}>
							<Popover.Popup className="z-50 h-80 w-72 overflow-hidden rounded-lg bg-popover shadow-lg ring-1 ring-foreground/10">
								<EmojiPicker
									onEmojiSelect={({ emoji }) => {
										handleToggle(emoji);
										setOpen(false);
									}}
									locale="zh"
								>
									<EmojiPickerSearch />
									<EmojiPickerContent />
									<EmojiPickerFooter />
								</EmojiPicker>
							</Popover.Popup>
						</Popover.Positioner>
					</Popover.Portal>
				</Popover.Root>
			)}
		</div>
	);
}

export { MemoReactions };
