import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	LexicalTypeaheadMenuPlugin,
	MenuOption,
	useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { useQuery } from "@tanstack/react-query";
import type { TextNode } from "lexical";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { memosStatsQueryOptions } from "@/features/memos/queries/memos-stats.query";

class TagOption extends MenuOption {
	name: string;
	constructor(name: string) {
		super(name);
		this.name = name;
	}
}

export function TagAutocompletePlugin() {
	const [editor] = useLexicalComposerContext();
	const { data: stats } = useQuery(memosStatsQueryOptions());
	const [queryString, setQueryString] = useState<string | null>(null);

	const existingTags = useMemo(() => {
		const tagNames = stats?.tags?.map((t) => t.name) ?? [];
		return [...new Set(tagNames)];
	}, [stats]);

	const triggerFn = useBasicTypeaheadTriggerMatch("#", { minLength: 0 });

	const onQueryChange = useCallback((text: string | null) => {
		setQueryString(text);
	}, []);

	const options = useMemo(() => {
		const sorted = existingTags.slice().sort((a, b) => a.length - b.length);
		if (!queryString) {
			return sorted.slice(0, 5).map((name) => new TagOption(name));
		}
		return sorted
			.filter((name) => name.toLowerCase().includes(queryString.toLowerCase()))
			.slice(0, 5)
			.map((name) => new TagOption(name));
	}, [existingTags, queryString]);

	const onSelectOption = useCallback(
		(
			option: TagOption,
			textNodeContainingQuery: TextNode | null,
			closeMenu: () => void,
		) => {
			editor.update(() => {
				if (textNodeContainingQuery?.isAttached()) {
					textNodeContainingQuery.setTextContent(`#${option.name} `);
					textNodeContainingQuery.select(
						textNodeContainingQuery.getTextContent().length,
					);
				}
				closeMenu();
			});
		},
		[editor],
	);

	const menuRenderFn = useCallback(
		(
			anchorRef: { current: HTMLElement | null },
			{
				selectedIndex,
				selectOptionAndCleanUp,
				options: menuOptions,
			}: {
				selectedIndex: number | null;
				selectOptionAndCleanUp: (option: TagOption) => void;
				setHighlightedIndex: (index: number) => void;
				options: TagOption[];
			},
		) => {
			if (menuOptions.length === 0 || !anchorRef.current) return null;

			return createPortal(
				<div
					className="min-w-[160px] rounded-lg border bg-popover p-1 shadow-md"
					style={{
						position: "absolute",
						top: anchorRef.current.getBoundingClientRect().bottom + 4,
						left: anchorRef.current.getBoundingClientRect().left,
					}}
				>
					{menuOptions.map((option, i) => (
						<button
							key={option.key}
							type="button"
							className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left font-medium text-xs transition-colors ${
								i === selectedIndex
									? "bg-accent text-accent-foreground"
									: "text-foreground hover:bg-accent/50"
							}`}
							onClick={() => {
								selectOptionAndCleanUp(option);
							}}
							onMouseEnter={() => {}}
						>
							<span className="text-muted-foreground">#</span>
							{option.name}
						</button>
					))}
				</div>,
				document.body,
			);
		},
		[],
	);

	return (
		<LexicalTypeaheadMenuPlugin<TagOption>
			triggerFn={triggerFn}
			onQueryChange={onQueryChange}
			onSelectOption={onSelectOption}
			options={options}
			menuRenderFn={menuRenderFn}
		/>
	);
}
