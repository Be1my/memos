import alchemy from "alchemy";
import { R2Bucket, TanStackStart } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });

const app = await alchemy("memos");

const bucket = await R2Bucket("attachments", {
	empty: true,
	dev: {
		remote: true,
	},
	adopt: true,
});

export const web = await TanStackStart("web", {
	cwd: "../../apps/web",
	bindings: {
		/* biome-ignore lint/style/noNonNullAssertion: env vars are defined at runtime */
		DATABASE_URL: alchemy.secret.env.DATABASE_URL!,
		/* biome-ignore lint/style/noNonNullAssertion: env vars are defined at runtime */
		CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
		/* biome-ignore lint/style/noNonNullAssertion: env vars are defined at runtime */
		BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
		/* biome-ignore lint/style/noNonNullAssertion: env vars are defined at runtime */
		BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
		/* biome-ignore lint/style/noNonNullAssertion: env vars are defined at runtime */
		ALLOWED_HOSTS: alchemy.env.ALLOWED_HOSTS!,
		ATTACHMENTS_BUCKET: bucket,
		/* biome-ignore lint/style/noNonNullAssertion: env vars are defined at runtime */
		R2_ACCOUNT_ID: alchemy.env.R2_ACCOUNT_ID!,
		/* biome-ignore lint/style/noNonNullAssertion: env vars are defined at runtime */
		R2_ACCESS_KEY_ID: alchemy.secret.env.R2_ACCESS_KEY_ID!,
		/* biome-ignore lint/style/noNonNullAssertion: env vars are defined at runtime */
		R2_SECRET_ACCESS_KEY: alchemy.secret.env.R2_SECRET_ACCESS_KEY!,
	},
});

console.log(`Web    -> ${web.url}`);

await app.finalize();
