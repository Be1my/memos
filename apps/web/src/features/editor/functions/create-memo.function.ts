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
	createdAt?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const createMemoFn = createServerFn({ method: "POST" })

	.inputValidator((input: unknown) => {
		const { content, payload, visibility, tags, files, createdAt } =
			input as CreateMemoInput;

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

		if (files) {
			for (const file of files) {
				if (typeof file.name !== "string" || file.name.length === 0) {
					throw new Error("Each file must have a non-empty name");
				}
				if (typeof file.type !== "string" || file.type.length === 0) {
					throw new Error("Each file must have a non-empty type");
				}
				if (typeof file.size !== "number" || file.size < 0) {
					throw new Error("Each file must have a valid size");
				}
				if (typeof file.base64 !== "string" || file.base64.length === 0) {
					throw new Error("Each file must have a non-empty base64 payload");
				}
			}
		}

		return {
			content,
			payload,
			visibility,
			tags,
			files: files ?? [],
			createdAt,
		};
	})
	.handler(async ({ data }) => {
		const [
			{ createDb },
			{ memo },
			{ attachment },
			{ env },
			{ createAuth },
			{ getRequestHeaders },
		] = await Promise.all([
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
			const insertData: typeof memo.$inferInsert = {
				uid: crypto.randomUUID(),
				creatorId: session.user.id,
				content: data.content,
				payload: data.payload ?? {},
				visibility: visibilityMap[data.visibility] ?? "PRIVATE",
				tags: data.tags ?? [],
			};
			if (data.createdAt) {
				insertData.createdAt = new Date(data.createdAt);
			}
			[created] = await db.insert(memo).values(insertData).returning();
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
			if (file.size > MAX_FILE_SIZE) {
				console.warn(
					`File ${file.name} exceeds maximum size of 50MB, skipping`,
				);
				continue;
			}
			if (!file.name) {
				console.warn("File has an empty name, skipping");
				continue;
			}
			if (!file.type) {
				console.warn(`File ${file.name} has an empty type, skipping`);
				continue;
			}
			if (!file.base64) {
				console.warn(`File ${file.name} has an empty base64 payload, skipping`);
				continue;
			}

			const key = `uploads/${created.id}/${crypto.randomUUID()}-${file.name}`;

			try {
				const bytes = Uint8Array.from(atob(file.base64), (c) =>
					c.charCodeAt(0),
				);

				await bucket.put(key, bytes.buffer, {
					httpMetadata: { contentType: file.type },
				});

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
			} catch (error) {
				console.error(`Failed to process file ${file.name}:`, error);
				try {
					await bucket.delete(key);
				} catch (deleteError) {
					console.error(`Failed to clean up R2 key ${key}:`, deleteError);
				}
			}
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
