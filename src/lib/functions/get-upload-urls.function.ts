import { createServerFn } from "@tanstack/react-start";
import { AwsClient } from "aws4fetch";
import { z } from "zod";
import { FileInfoSchema } from "@/lib/schemas/file";
import { coreMiddleware } from "@/middleware";
import { UnauthorizedError } from "@/lib/errors";

const FileUrlRequestSchema = z.object({
	files: z.array(FileInfoSchema),
});

export const getUploadPresignedUrlsFn = createServerFn({ method: "POST" })
	.inputValidator(FileUrlRequestSchema)
	.middleware([coreMiddleware])
	.handler(async ({ data, context }) => {
		if (!context.session) {
			throw new UnauthorizedError();
		}
		const r2 = new AwsClient({
			accessKeyId: context.env.R2_ACCESS_KEY_ID,
			secretAccessKey: context.env.R2_SECRET_ACCESS_KEY,
		});

		const bucketName = "memos-attachments-eimy";
		const endpoint = `https://${context.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

		const urls = await Promise.all(
			data.files.map(async (file) => {
				const safeName = file.name.replace(/[/\\?&#%]/g, "_");
				const key = `uploads/${crypto.randomUUID()}-${safeName}`;
				const url = new URL(`${endpoint}/${bucketName}/${key}`);
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