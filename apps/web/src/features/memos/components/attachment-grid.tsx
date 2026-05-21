import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@memos/ui/components/dialog";
import { FileIcon, ImageIcon } from "lucide-react";
import type { listMemosFn } from "../functions/list-memos.function";

type Attachment = Awaited<
	ReturnType<typeof listMemosFn>
>[number]["attachments"][number];

function attachmentUrl(att: Attachment) {
	return `/api/files?key=${encodeURIComponent(att.reference)}`;
}

function AttachmentGrid({ attachments }: { attachments: Attachment[] }) {
	return (
		<div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
			{attachments.map((att) =>
				att.type.startsWith("image/") ? (
					<Dialog key={att.uid}>
						<DialogTrigger
							render={
								<button
									type="button"
									className="group relative aspect-video overflow-hidden rounded-md bg-muted/50"
								>
									<img
										src={attachmentUrl(att)}
										alt={att.filename}
										className="size-full object-cover"
										loading="lazy"
									/>
									<div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
								</button>
							}
						/>
						<DialogContent className="grid w-auto max-w-none place-items-center border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-none">
							<img
								src={attachmentUrl(att)}
								alt={att.filename}
								className="max-h-[85vh] max-w-[85vw] rounded object-contain"
							/>
						</DialogContent>
					</Dialog>
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
	);
}

export { AttachmentGrid };
