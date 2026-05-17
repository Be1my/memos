"use client";

import { Popover } from "@base-ui/react/popover";
import { EmojiPickerFooter } from "@memos/ui/components/emoji-picker";
import { cn } from "@memos/ui/lib/utils";
import {
	type EmojiPickerListEmojiProps,
	EmojiPicker as Primitive,
} from "frimousse";
import { LoaderIcon, SearchIcon, SmilePlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useToggleReaction } from "../queries/reactions.query";

interface ReactionTriggerProps {
	contentId: string;
	reactedEmojis: Set<string>;
}

function CustomEmoji({
	emoji,
	reactedEmojis,
	...props
}: EmojiPickerListEmojiProps & { reactedEmojis: Set<string> }) {
	const hasReacted = reactedEmojis.has(emoji.emoji);
	return (
		<button
			{...props}
			className={cn(
				"flex size-7 items-center justify-center rounded-sm text-base",
				hasReacted && "bg-accent",
			)}
		>
			{emoji.emoji}
		</button>
	);
}

function ReactionTrigger({ contentId, reactedEmojis }: ReactionTriggerProps) {
	const toggleMutation = useToggleReaction();
	const [open, setOpen] = useState(false);

	const handleToggle = (emoji: string) => {
		toggleMutation.mutate({ data: { contentId, reactionType: emoji } });
		setOpen(false);
	};

	const Emoji = useMemo(
		() => (props: EmojiPickerListEmojiProps) => (
			<CustomEmoji {...props} reactedEmojis={reactedEmojis} />
		),
		[reactedEmojis],
	);

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover/memo:opacity-100">
				<SmilePlusIcon className="size-4" />
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner side="bottom" align="end" sideOffset={4}>
					<Popover.Popup className="z-50 h-80 w-72 overflow-hidden rounded-lg bg-popover shadow-lg ring-1 ring-foreground/10">
						<Primitive.Root
							onEmojiSelect={({ emoji }) => {
								handleToggle(emoji);
							}}
							locale="zh"
							className="isolate flex h-full w-fit flex-col overflow-hidden rounded-md bg-popover text-popover-foreground"
						>
							<div className="flex h-9 items-center gap-2 border-b px-3">
								<SearchIcon className="size-4 shrink-0 opacity-50" />
								<Primitive.Search className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" />
							</div>
							<Primitive.Viewport className="relative flex-1 outline-hidden">
								<Primitive.Loading className="absolute inset-0 flex items-center justify-center text-muted-foreground">
									<LoaderIcon className="size-4 animate-spin" />
								</Primitive.Loading>
								<Primitive.Empty className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
									No emoji found.
								</Primitive.Empty>
								<Primitive.List
									className="select-none px-1 pb-1"
									components={{
										Emoji,
									}}
								/>
							</Primitive.Viewport>
							<EmojiPickerFooter />
						</Primitive.Root>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}

export { ReactionTrigger };
