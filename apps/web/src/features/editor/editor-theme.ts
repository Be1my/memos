import type { EditorThemeClasses } from "lexical";

export const editorTheme: EditorThemeClasses = {
	hashtag: "text-primary font-medium",
	paragraph: "m-0 leading-relaxed",
	text: {
		bold: "font-bold",
		italic: "italic",
	},
	placeholder:
		"text-muted-foreground pointer-events-none absolute top-3.5 left-3.5 select-none overflow-hidden text-ellipsis whitespace-nowrap",
};
