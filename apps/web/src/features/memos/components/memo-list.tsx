import { Temporal } from "@js-temporal/polyfill";
import { Skeleton } from "@memos/ui/components/skeleton";
import { FileIcon, ImageIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { LexicalRenderer } from "../../editor/components/lexical-renderer";
import type { listMemosFn } from "../../editor/functions/list-memos.function";
import { MemoReactions } from "./memo-reactions";
import { ReactionTrigger } from "./reaction-trigger";

type Memo = Awaited<ReturnType<typeof listMemosFn>>[number];

function attachmentUrl(att: Memo["attachments"][number]) {
	return `/api/files?key=${encodeURIComponent(att.reference)}`;
}

const visibilityLabel: Record<string, string> = {
	PRIVATE: "私有",
	PUBLIC: "公开",
	PROTECTED: "工作区",
};

function FormattedTime({ date }: { date: string }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return <Skeleton className="inline-block h-3 w-24 align-middle" />;
	}

	let instant: Temporal.Instant;
	try {
		instant = Temporal.Instant.from(date);
	} catch {
		return <>{date}</>;
	}
	return (
		<>
			{new Intl.DateTimeFormat(undefined, {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
			}).format(instant.epochMilliseconds)}
		</>
	);
}

function ImagePreview({
	src,
	filename,
	onClose,
}: {
	src: string;
	filename: string;
	onClose: () => void;
}) {
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [onClose]);

	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: overlay with role=presentation */}
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
				role="presentation"
				onClick={onClose}
			>
				<button
					type="button"
					className="absolute top-4 right-4 text-white/70 hover:text-white"
					onClick={onClose}
				>
					<XIcon className="size-6" />
				</button>
				<img
					src={src}
					alt={filename}
					className="max-h-full max-w-full rounded object-contain"
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				/>
			</div>
		</>
	);
}

function MemoList({
	memos,
	userId,
}: {
	memos: Memo[];
	userId?: string | null;
}) {
	const [preview, setPreview] = useState<string | null>(null);

	if (!memos.length) {
		return (
			<div className="mt-8 rounded-md border border-dashed px-3 py-8 text-center text-muted-foreground text-xs">
				没有找到数据
			</div>
		);
	}

	return (
		<>
			{preview && (
				<ImagePreview
					src={preview}
					filename=""
					onClose={() => setPreview(null)}
				/>
			)}
			<div className="mt-8 space-y-3">
				{memos.map((memo) => (
					<div
						key={memo.uid}
						className="group/memo relative rounded-lg border bg-card p-4 text-sm"
					>
						{userId && (
							<div className="absolute top-2 right-2">
								<ReactionTrigger contentId={memo.uid} />
							</div>
						)}
						<div className="leading-relaxed">
							<LexicalRenderer payload={memo.payload} />
						</div>
						{memo.attachments && memo.attachments.length > 0 && (
							<div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
								{memo.attachments.map((att) =>
									att.type.startsWith("image/") ? (
										<button
											key={att.uid}
											type="button"
											className="group relative aspect-video overflow-hidden rounded-md bg-muted/50"
											onClick={() => setPreview(attachmentUrl(att))}
										>
											<img
												src={attachmentUrl(att)}
												alt={att.filename}
												className="size-full object-cover"
												loading="lazy"
											/>
											<div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
										</button>
									) : (
										<a
											key={att.uid}
											href={attachmentUrl(att)}
											target="_blank"
											rel="noreferrer"
											className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-2 text-xs transition-colors hover:bg-muted/80"
										>
											{att.type.startsWith("video/") ? (
												<ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
											) : (
												<FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
											)}
											<span className="min-w-0 truncate text-muted-foreground">
												{att.filename}
											</span>
										</a>
									),
								)}
							</div>
						)}
						<MemoReactions
							contentId={memo.uid}
							currentUserId={userId ?? undefined}
							reactions={memo.reactions}
						/>
						<div className="mt-2 flex items-center gap-2 text-muted-foreground text-xs">
							<span>{visibilityLabel[memo.visibility] ?? memo.visibility}</span>
							<FormattedTime date={memo.createdAt} />
						</div>
					</div>
				))}
			</div>
		</>
	);
}

export { MemoList };
