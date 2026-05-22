import { env } from "@memos/env/server";
import { createServerFn } from "@tanstack/react-start";
import { AwsClient } from "aws4fetch";
import { z } from "zod";
import { FileInfoSchema } from "@/lib/schemas/file";
import { authMiddleware } from "@/middleware/auth";

const FileUrlRequestSchema = z.object({
	files: z.array(FileInfoSchema),
});

export const getUploadPresignedUrlsFn = createServerFn({ method: "POST" })
	.inputValidator(FileUrlRequestSchema)
	.middleware([authMiddleware])
	.handler(async ({ data }) => {
		const r2 = new AwsClient({
			accessKeyId: env.R2_ACCESS_KEY_ID,
			secretAccessKey: env.R2_SECRET_ACCESS_KEY,
		});

		const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

		const urls = await Promise.all(
			data.files.map(async (file) => {
				const safeName = file.name.replace(/[/\\?&#%]/g, "_");
				const key = `uploads/${crypto.randomUUID()}-${safeName}`;
				const url = new URL(`${endpoint}/attachments/${key}`);
				url.searchParams.set("X-Amz-Expires", "3600");

				const signed = await r2.sign(
					new Request(url, {
						method: "PUT",
						headers: { "Content-Type": file.type },
					}),
					{ aws: { signQuery: true } },
				);

				return { key, url: signed.url };
			}),
		);

		return { urls };
	});
