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
		chunkSizeWarningLimit: 1200,
		rolldownOptions: {
			...(shouldUseAlchemy ? { external: ["cloudflare:workers"] } : {}),
			output: {
				codeSplitting: {
					groups: [
						{
							name: "react-vendor",
							test: /node_modules[\\/](react[\\/]|react-dom[\\/]|scheduler[\\/])/,
							priority: 30,
						},
						{
							name: "tanstack-router",
							test: /node_modules[\\/]@tanstack[\\/]react-router/,
							priority: 25,
						},
						{
							name: "tanstack-query",
							test: /node_modules[\\/]@tanstack[\\/]react-query/,
							priority: 25,
						},
						{
							name: "tanstack-start",
							test: /node_modules[\\/]@tanstack[\\/]react-start/,
							priority: 25,
						},
						{
							name: "base-ui",
							test: /node_modules[\\/]@base-ui[\\/]/,
							priority: 20,
						},
						{
							name: "vendor",
							test: /node_modules[\\/]/,
							minSize: 20000,
							priority: 5,
						},
					],
				},
			},
		},
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
