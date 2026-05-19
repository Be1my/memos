"use client";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@memos/ui/components/popover";
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
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover/memo:opacity-100">
				<SmilePlusIcon className="size-4" />
			</PopoverTrigger>
			<PopoverContent side="bottom" align="end" sideOffset={4} className="h-80 w-72 overflow-hidden p-0">
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
			</PopoverContent>
		</Popover>
	);
}

export { ReactionTrigger };
