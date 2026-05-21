import { useNavigate, useSearch } from "@tanstack/react-router";
import { CalendarIcon, SearchIcon, TagIcon, XIcon } from "lucide-react";
import { useMemo } from "react";
import { m } from "@/paraglide/messages";

const iconMap: Record<string, typeof SearchIcon> = {
	q: SearchIcon,
	date: CalendarIcon,
	tag: TagIcon,
};

export function ActiveFilters() {
	const search = useSearch({ strict: false }) as {
		q?: string;
		date?: string;
		tag?: string;
	};
	const navigate = useNavigate();

	const filters = useMemo(() => {
		const result: { key: string; label: string }[] = [];
		if (search.q) {
			result.push({ key: "q", label: search.q });
		}
		if (search.date) {
			result.push({ key: "date", label: search.date });
		}
		if (search.tag) {
			result.push({ key: "tag", label: search.tag });
		}
		return result;
	}, [search.q, search.date, search.tag]);

	if (filters.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-2">
			{filters.map((f) => {
				const Icon = iconMap[f.key];
				return (
					<span
						key={f.key}
						className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-primary text-sm transition-colors hover:bg-primary/20"
					>
						<Icon className="size-3.5" />
						{f.label}
						<button
							type="button"
							onClick={() =>
								navigate({
									to: ".",
									search: (prev: Record<string, unknown>) => ({
										...prev,
										[f.key]: undefined,
									}),
									replace: true,
								})
							}
							className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
							aria-label={`${m.search_filter_remove()} ${f.label}`}
						>
							<XIcon className="size-3" />
						</button>
					</span>
				);
			})}
		</div>
	);
}
