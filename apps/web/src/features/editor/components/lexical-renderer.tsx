import type { ReactNode } from "react";

type TextNode = {
	type: "text";
	text: string;
	format?: number;
	bold?: boolean;
	italic?: boolean;
	strikethrough?: boolean;
	underline?: boolean;
	code?: boolean;
};

type ElementNode = {
	type: string;
	children: (TextNode | ElementNode)[];
	format?: number;
	[key: string]: unknown;
};

function renderText(node: TextNode): ReactNode {
	let children: ReactNode = node.text;
	if (node.format !== undefined) {
		if (node.format & 1) children = <strong>{children}</strong>;
		if (node.format & 2) children = <em>{children}</em>;
		if (node.format & 8) children = <u>{children}</u>;
		if (node.format & 4) children = <s>{children}</s>;
		if (node.format & 16) children = <code>{children}</code>;
	}
	return children;
}

function renderNode(node: TextNode | ElementNode, index: number): ReactNode {
	if (node.type === "text") {
		return <span key={index}>{renderText(node as TextNode)}</span>;
	}

	const el = node as ElementNode;
	const children = el.children?.map((child, i) => renderNode(child, i)) ?? null;

	switch (el.type) {
		case "paragraph":
			return <p key={index}>{children}</p>;
		case "heading":
			switch (el.tag as string) {
				case "h1":
					return <h1 key={index}>{children}</h1>;
				case "h2":
					return <h2 key={index}>{children}</h2>;
				case "h3":
					return <h3 key={index}>{children}</h3>;
				case "h4":
					return <h4 key={index}>{children}</h4>;
				case "h5":
					return <h5 key={index}>{children}</h5>;
				case "h6":
					return <h6 key={index}>{children}</h6>;
				default:
					return <p key={index}>{children}</p>;
			}
		case "list":
			if (el.listType === "bullet") {
				return <ul key={index}>{children}</ul>;
			}
			return <ol key={index}>{children}</ol>;
		case "listitem":
			return <li key={index}>{children}</li>;
		case "quote":
			return <blockquote key={index}>{children}</blockquote>;
		case "code":
			return (
				<pre key={index}>
					<code>{children}</code>
				</pre>
			);
		case "link":
			return (
				<a key={index} href={el.url as string}>
					{children}
				</a>
			);
		case "horizontalrule":
			return <hr key={index} />;
		case "linebreak":
			return <br key={index} />;
		default:
			return children ?? null;
	}
}

function LexicalRenderer({ payload }: { payload: Record<string, unknown> }) {
	const root = payload as { root?: ElementNode };
	if (!root?.root?.children?.length) {
		return null;
	}

	return root.root.children.map((node, i) => renderNode(node, i));
}

export { LexicalRenderer };
