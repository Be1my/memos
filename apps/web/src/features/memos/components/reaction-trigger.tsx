"use client";

import { Popover } from "@base-ui/react/popover";
import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "@memos/ui/components/emoji-picker";
import { SmilePlusIcon } from "lucide-react";
import { useState } from "react";
import { useToggleReaction } from "../queries/reactions.query";

interface ReactionTriggerProps {
	contentId: string;
	currentUserId?: string;
}

function ReactionTrigger({ contentId, currentUserId }: ReactionTriggerProps) {
	const toggleMutation = useToggleReaction(currentUserId);
	const [open, setOpen] = useState(false);

	const handleToggle = (emoji: string) => {
		toggleMutation.mutate({ data: { contentId, reactionType: emoji } });
		setOpen(false);
	};

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover/memo:opacity-100">
				<SmilePlusIcon className="size-4" />
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner side="bottom" align="end" sideOffset={4}>
					<Popover.Popup className="z-50 h-80 w-72 overflow-hidden rounded-lg bg-popover shadow-lg ring-1 ring-foreground/10">
						<EmojiPicker
							onEmojiSelect={({ emoji }) => {
								handleToggle(emoji);
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
	);
}

export { ReactionTrigger };
