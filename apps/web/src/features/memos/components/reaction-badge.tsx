import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@memos/ui/components/tooltip";
import type { ReactionUser } from "../queries/reactions.query";

interface ReactionBadgeProps {
	emoji: string;
	users: ReactionUser[];
	currentUserId?: string;
	onToggle: (emoji: string) => void;
}

function formatReactionText(users: ReactionUser[]): string {
	if (users.length === 1) {
		return `${users[0].creatorName} reacted with ${users[0].reactionType}`;
	}
	if (users.length === 2) {
		return `${users[0].creatorName} and ${users[1].creatorName} reacted with ${users[0].reactionType}`;
	}
	if (users.length === 3) {
		return `${users[0].creatorName}, ${users[1].creatorName} and ${users[2].creatorName} reacted with ${users[0].reactionType}`;
	}
	return `${users[0].creatorName}, ${users[1].creatorName}, ${users[2].creatorName} and ${users.length - 3} more reacted with ${users[0].reactionType}`;
}

function ReactionBadge({
	emoji,
	users,
	currentUserId,
	onToggle,
}: ReactionBadgeProps) {
	const hasReacted = users.some((u) => u.creatorId === currentUserId);

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<button
						type="button"
						onClick={() => onToggle(emoji)}
						data-active={hasReacted || undefined}
						className="flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs transition-colors hover:bg-accent data-[active]:border-primary/30 data-[active]:bg-accent"
					>
						<span className="text-sm leading-none">{emoji}</span>
						<span className="text-muted-foreground">{users.length}</span>
					</button>
				</TooltipTrigger>
				<TooltipContent side="top" align="center">
					{formatReactionText(users)}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export { ReactionBadge };
