import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { paraglideVitePlugin } from "@inlang/paraglide-js";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import alchemy from "alchemy/cloudflare/tanstack-start";
import { defineConfig } from "vite";

const alchemyConfigPath = fileURLToPath(
	new URL("./.alchemy/local/wrangler.jsonc", import.meta.url),
);
const shouldUseAlchemy = existsSync(alchemyConfigPath);
const cloudflareWorkersShimPath = fileURLToPath(
	new URL("../../packages/env/src/cloudflare-local.ts", import.meta.url),
);
const cloudflareWorkersAlias: Record<string, string> = {
	"cloudflare:workers": cloudflareWorkersShimPath,
};

export default defineConfig({
	server: {
		port: 3001,
	},
	preview: {
		port: 3001,
		strictPort: true,
	},
	resolve: {
		tsconfigPaths: true,
		alias: cloudflareWorkersAlias,
	},
	build: {
		rolldownOptions: shouldUseAlchemy
			? { external: ["cloudflare:workers"] }
			: undefined,
	},
	plugins: [
		tailwindcss(),
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/paraglide",
			outputStructure: "message-modules",
			cookieName: "PARAGLIDE_LOCALE",
			strategy: ["cookie", "preferredLanguage", "baseLocale"],
		}),
		tanstackStart({}),
		viteReact(),
		...(shouldUseAlchemy ? [alchemy({ configPath: alchemyConfigPath })] : []),
	],
});
