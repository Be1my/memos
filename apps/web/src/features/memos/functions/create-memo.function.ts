import { createDb } from "@memos/db";
import { attachment } from "@memos/db/schema/attachment.table";
import { memo } from "@memos/db/schema/memo.table";
import { VISIBILITY_MAP } from "@memos/db/schema/enums";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { internalError, unauthorized } from "@/lib/errors";
import { authMiddleware } from "@/middleware/auth";

import { CreateMemoInputSchema, type FileData } from "../schemas/create-memo";

export type FilePayload = FileData;

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const createMemoFn = createServerFn({ method: "POST" })

	.inputValidator(CreateMemoInputSchema)
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		if (!context.session) {
			throw unauthorized();
		}

		const db = createDb();

		let created: typeof memo.$inferSelect;
		try {
			const insertData: typeof memo.$inferInsert = {
				uid: crypto.randomUUID(),
				creatorId: context.session.user.id,
				content: data.content,
				payload: data.payload ?? {},
				visibility: VISIBILITY_MAP[data.visibility] ?? "PRIVATE",
				tags: data.tags ?? [],
			};
			if (data.createdAt) {
				insertData.createdAt = new Date(data.createdAt);
				insertData.updatedAt = new Date(data.createdAt);
			}
			[created] = await db.insert(memo).values(insertData).returning();
		} catch (error) {
			console.error("Failed to create memo:", error);
			throw internalError("Failed to create memo");
		}

		const createdAttachments: Array<{
			id: number;
			uid: string;
			filename: string;
			type: string;
			size: number;
			storageType: string;
			reference: string;
		}> = [];

		for (const file of data.files) {
			if (file.size > MAX_FILE_SIZE) {
				console.warn(
					`File ${file.name} exceeds maximum size of 50MB, skipping`,
				);
				continue;
			}

			try {
				const [att] = await db
					.insert(attachment)
					.values({
						uid: crypto.randomUUID(),
						creatorId: context.session.user.id,
						memoId: created.id,
						filename: file.name,
						type: file.type,
						size: file.size,
						storageType: "R2",
						reference: file.key,
					})
					.returning();

				createdAttachments.push({
					id: att.id,
					uid: att.uid,
					filename: att.filename,
					type: att.type,
					size: att.size,
					storageType: att.storageType,
					reference: att.reference,
				});
			} catch (error) {
				console.error(`Failed to record file ${file.name}:`, error);
			}
		}

		setResponseStatus(201);
		return {
			id: created.id,
			uid: created.uid,
			creatorId: created.creatorId,
			content: created.content,
			visibility: created.visibility,
			rowStatus: created.rowStatus,
			pinned: created.pinned,
			tags: created.tags,
			createdAt: created.createdAt.toISOString(),
			updatedAt: created.updatedAt.toISOString(),
			createdAttachments,
		};
	});
