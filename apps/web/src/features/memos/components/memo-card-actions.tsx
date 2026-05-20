"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@memos/ui/components/dropdown-menu";
import {
	ArchiveIcon,
	CopyIcon,
	FileTextIcon,
	LinkIcon,
	MoreVerticalIcon,
	PencilIcon,
	PinIcon,
	Trash2Icon,
} from "lucide-react";
import { useTogglePin } from "../queries/pin-memo.query";

interface MemoCardActionsProps {
	memoUid: string;
	pinned: boolean;
	onEdit?: () => void;
}

function MemoCardActions({ memoUid, pinned, onEdit }: MemoCardActionsProps) {
	const togglePin = useTogglePin();

	const handleTogglePin = () => {
		togglePin.mutate({ data: { memoId: memoUid } });
	};
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
				<MoreVerticalIcon className="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" sideOffset={4}>
				<DropdownMenuItem onClick={handleTogglePin}>
					<PinIcon className="size-4" />
					{pinned ? "取消固定" : "固定"}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onEdit}>
					<PencilIcon className="size-4" />
					编辑
				</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<CopyIcon className="size-4" />
						复制
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem>
							<LinkIcon className="size-4" />
							复制链接
						</DropdownMenuItem>
						<DropdownMenuItem>
							<FileTextIcon className="size-4" />
							复制内容
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<ArchiveIcon className="size-4" />
					归档
				</DropdownMenuItem>
				<DropdownMenuItem variant="destructive">
					<Trash2Icon className="size-4" />
					删除
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { MemoCardActions };
