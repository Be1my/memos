import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";

interface TagItem {
	name: string;
	count: number;
}

interface TagsProps {
	tags: TagItem[];
}

export function Tags({ tags }: TagsProps) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { tag?: string };

	const handleTagClick = useCallback(
		(name: string) => {
			navigate({
				to: ".",
				search: (prev: Record<string, unknown>) => ({
					...prev,
					tag: prev.tag === name ? undefined : name,
					date: undefined,
					q: undefined,
				}),
				replace: true,
			});
		},
		[navigate],
	);

	if (tags.length === 0) {
		return (
			<div className="rounded-md border border-dashed px-3 py-4 text-center text-muted-foreground text-xs">
				暂无标签
			</div>
		);
	}

	return (
		<div className="flex flex-wrap gap-1.5">
			{tags.map((tag) => {
				const isSelected = search.tag === tag.name;
				return (
					<button
						key={tag.name}
						type="button"
						onClick={() => handleTagClick(tag.name)}
						className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium text-xs transition-colors ${
							isSelected
								? "border-primary bg-primary text-primary-foreground"
								: "border-border hover:bg-accent"
						}`}
					>
						{tag.name}
						<span
							className={`text-[10px] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}
						>
							{tag.count}
						</span>
					</button>
				);
			})}
		</div>
	);
}
