"use client";

import type { ReactionUser } from "../queries/reactions.query";
import { useToggleReaction } from "../queries/reactions.query";
import { ReactionBadge } from "./reaction-badge";

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
	reactions: ReactionUser[];
}

function MemoReactions({
	contentId,
	currentUserId,
	reactions,
}: MemoReactionsProps) {
	const toggleMutation = useToggleReaction();
	const grouped = groupReactions(reactions);
	const hasReactions = reactions.length > 0;

	const handleToggle = (emoji: string) => {
		toggleMutation.mutate({ data: { contentId, reactionType: emoji } });
	};

	if (!hasReactions) {
		return null;
	}

	return (
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
	);
}

export { MemoReactions };
