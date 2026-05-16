import { Input } from "@memos/ui/components/input";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function SearchBox() {
	const { q: initialQ } = useSearch({ strict: false }) as { q?: string };
	const [value, setValue] = useState(initialQ ?? "");
	const navigate = useNavigate();

	useEffect(() => {
		setValue(initialQ ?? "");
	}, [initialQ]);

	useEffect(() => {
		const timer = setTimeout(() => {
			navigate({
				to: ".",
				search: (prev: Record<string, unknown>) => ({
					...prev,
					q: value || undefined,
					page: undefined,
				}),
				replace: true,
			});
		}, 300);
		return () => clearTimeout(timer);
	}, [value, navigate]);

	return (
		<div className="relative">
			<SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="搜索..."
				className="h-9 pl-8 pr-8 text-sm"
			/>
			{value && (
				<button
					type="button"
					onClick={() => setValue("")}
					className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
				>
					<XIcon className="size-4" />
				</button>
			)}
		</div>
	);
}
