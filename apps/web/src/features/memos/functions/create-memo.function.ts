import { createDb } from "@memos/db";
import { attachment } from "@memos/db/schema/attachment.table";
import { VISIBILITY_MAP } from "@memos/db/schema/enums";
import { type JsonObject, memo } from "@memos/db/schema/memo.table";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { authMiddleware } from "@/middleware/auth";

import { CreateMemoInputSchema, type FileData } from "../schemas/create-memo";

export type FilePayload = FileData;

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const createMemoFn = createServerFn({ method: "POST" })

	.inputValidator(CreateMemoInputSchema)
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		const { user } = context.session;
		const db = createDb();

		const result = await db.transaction(async (tx) => {
			const insertData: typeof memo.$inferInsert = {
				uid: crypto.randomUUID(),
				creatorId: user.id,
				content: data.content,
				payload: (data.payload ?? {}) as JsonObject,
				visibility: VISIBILITY_MAP[data.visibility] ?? "PRIVATE",
				tags: data.tags ?? [],
			};
			if (data.createdAt) {
				insertData.createdAt = new Date(data.createdAt);
				insertData.updatedAt = new Date(data.createdAt);
			}
			const [created] = await tx.insert(memo).values(insertData).returning();

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
					throw new Error(
						`File ${file.name} (${file.size} bytes) exceeds maximum size of 50MB`,
					);
				}

				const [att] = await tx
					.insert(attachment)
					.values({
						uid: crypto.randomUUID(),
						creatorId: user.id,
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
			}

			return { created, createdAttachments };
		});

		setResponseStatus(201);
		return {
			id: result.created.id,
			uid: result.created.uid,
			creatorId: result.created.creatorId,
			content: result.created.content,
			visibility: result.created.visibility,
			rowStatus: result.created.rowStatus,
			pinned: result.created.pinned,
			tags: result.created.tags,
			createdAt: result.created.createdAt.toISOString(),
			updatedAt: result.created.updatedAt.toISOString(),
			createdAttachments: result.createdAttachments,
		};
	});
