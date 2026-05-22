import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { paraglideVitePlugin } from "@inlang/paraglide-js";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import alchemy from "alchemy/cloudflare/tanstack-start";
import { defineConfig, type Plugin } from "vite";

const alchemyConfigPath = fileURLToPath(
	new URL("./.alchemy/local/wrangler.jsonc", import.meta.url),
);
const shouldUseAlchemy = existsSync(alchemyConfigPath);
const cloudflareWorkersShimPath = fileURLToPath(
	new URL("../../packages/env/src/cloudflare-local.ts", import.meta.url),
);

function stripCfWorkersPlugin(): Plugin {
	return {
		name: "strip-cf-workers",
		renderChunk(code, _chunk, _options) {
			if (!code.includes("cloudflare:workers")) return null;
			if (this.environment?.name === "client") {
				return code.replace(
					/import\s*["']cloudflare:workers["']\s*;?\s*/g,
					"/* cloudflare:workers stripped */",
				);
			}
			if (code.includes('"/cloudflare:workers"')) {
				return code.replace(/"\/cloudflare:workers"\s*,?\s*/g, "");
			}
			return null;
		},
	};
}

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
		alias: shouldUseAlchemy
			? undefined
			: { "cloudflare:workers": cloudflareWorkersShimPath },
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
		...(shouldUseAlchemy
			? [stripCfWorkersPlugin(), alchemy({ configPath: alchemyConfigPath })]
			: []),
	],
});
