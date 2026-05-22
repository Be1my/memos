import { createDb } from "@memos/db";
import { attachment } from "@memos/db/schema/attachment.table";
import { VISIBILITY_MAP } from "@memos/db/schema/enums";
import { memo } from "@memos/db/schema/memo.table";
import { env } from "@memos/env/server";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { AwsClient } from "aws4fetch";
import { eq } from "drizzle-orm";
import { authMiddleware } from "@/middleware/auth";

import { CreateMemoInputSchema, type FileData } from "../schemas/create-memo";

export type FilePayload = FileData;

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const createMemoFn = createServerFn({ method: "POST" })

	.inputValidator(CreateMemoInputSchema)
	.middleware([authMiddleware])
	.handler(async ({ data, context }) => {
		for (const file of data.files) {
			if (file.size > MAX_FILE_SIZE) {
				throw new Error(
					`File ${file.name} (${file.size} bytes) exceeds maximum size of 50MB`,
				);
			}
		}

		const { user } = context.session;
		const db = createDb();

		const insertData: typeof memo.$inferInsert = {
			uid: crypto.randomUUID(),
			creatorId: user.id,
			content: data.content,
			payload: data.payload ?? {},
			visibility: VISIBILITY_MAP[data.visibility] ?? "PRIVATE",
			tags: data.tags ?? [],
		};
		if (data.createdAt) {
			insertData.createdAt = new Date(data.createdAt);
			insertData.updatedAt = new Date(data.createdAt);
		}
		const [created] = await db.insert(memo).values(insertData).returning();

		let createdAttachments: Array<{
			id: number;
			uid: string;
			filename: string;
			type: string;
			size: number;
			storageType: string;
			reference: string;
		}> = [];

		if (data.files.length > 0) {
			try {
				const atts = await db
					.insert(attachment)
					.values(
						data.files.map((file) => ({
							uid: crypto.randomUUID(),
							creatorId: user.id,
							memoId: created.id,
							filename: file.name,
							type: file.type,
							size: file.size,
							storageType: "R2" as const,
							reference: file.key,
						})),
					)
					.returning();

				createdAttachments = atts.map((att) => ({
					id: att.id,
					uid: att.uid,
					filename: att.filename,
					type: att.type,
					size: att.size,
					storageType: att.storageType,
					reference: att.reference,
				}));
			} catch (error) {
				await db.delete(memo).where(eq(memo.id, created.id));
				await deleteFromR2(data.files);
				throw error;
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

async function deleteFromR2(files: FileData[]) {
	const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
	const r2 = new AwsClient({
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
	});

	await Promise.allSettled(
		files.map((file) => {
			const url = new URL(`${endpoint}/attachments/${file.key}`);
			return r2.fetch(new Request(url, { method: "DELETE" }));
		}),
	);
}
