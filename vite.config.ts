import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		plugins: [
			paraglideVitePlugin({
				project: "./project.inlang",
				outdir: "./src/paraglide",
				outputStructure: "message-modules",
				cookieName: "PARAGLIDE_LOCALE",
				strategy: ["cookie", "preferredLanguage", "baseLocale"],
			}),
			cloudflare({
				viteEnvironment: {
					name: "ssr",
				},
			}),
			viteTsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
			tailwindcss(),
			tanstackStart({}),
			viteReact(),
		],
	};
});

export default config;