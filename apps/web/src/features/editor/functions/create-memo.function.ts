import { createServerFn } from "@tanstack/react-start";

const visibilityMap: Record<string, "PRIVATE" | "PUBLIC" | "PROTECTED"> = {
	private: "PRIVATE",
	workspace: "PROTECTED",
	public: "PUBLIC",
};

export interface FilePayload {
	name: string;
	type: string;
	size: number;
	base64: string;
}

interface CreateMemoInput {
	content: string;
	payload: Record<string, unknown>;
	visibility: string;
	tags?: string[];
	files?: FilePayload[];
}

export const createMemoFn = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => {
		const { content, payload, visibility, tags, files } = input as CreateMemoInput;

		if (!content?.trim()) {
			throw new Error("Content is required");
		}

		if (
			payload !== undefined &&
			(typeof payload !== "object" ||
				payload === null ||
				Array.isArray(payload))
		) {
			throw new Error("Payload must be a plain object");
		}

		return { content, payload, visibility, tags, files: files ?? [] };
	})
	.handler(async ({ data }) => {
		const [{ createDb }, { memo }, { attachment }, { env }, { createAuth }, { getRequestHeaders }] =
			await Promise.all([
				import("@memos/db"),
				import("@memos/db/schema/memo.table"),
				import("@memos/db/schema/attachment.table"),
				import("@memos/env/server"),
				import("@memos/auth"),
				import("@tanstack/react-start/server"),
			]);

		const headers = getRequestHeaders();
		const session = await createAuth().api.getSession({ headers });
		if (!session) {
			throw new Error("Not authenticated");
		}

		const db = createDb();

		let created: typeof memo.$inferSelect;
		try {
			[created] = await db
				.insert(memo)
				.values({
					uid: crypto.randomUUID(),
					creatorId: session.user.id,
					content: data.content,
					payload: data.payload ?? {},
					visibility: visibilityMap[data.visibility] ?? "PRIVATE",
					tags: data.tags ?? [],
				})
				.returning();
		} catch (error) {
			console.error("Failed to create memo:", error);
			throw new Error("Failed to create memo");
		}

		const bucket = env.ATTACHMENTS_BUCKET;
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
			const key = `uploads/${created.id}/${crypto.randomUUID()}-${file.name}`;
			const binaryStr = atob(file.base64);
			const bytes = new Uint8Array(binaryStr.length);
			for (let i = 0; i < binaryStr.length; i++) {
				bytes[i] = binaryStr.charCodeAt(i);
			}

			try {
				await bucket.put(key, bytes.buffer, {
					httpMetadata: { contentType: file.type },
				});
			} catch (error) {
				console.error(`Failed to upload ${file.name}:`, error);
				continue;
			}

			const [att] = await db
				.insert(attachment)
				.values({
					uid: crypto.randomUUID(),
					creatorId: session.user.id,
					memoId: created.id,
					filename: file.name,
					type: file.type,
					size: file.size,
					storageType: "R2",
					reference: key,
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
