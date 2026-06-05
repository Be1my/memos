import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
const config = defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
			tsconfigPaths: true,
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks: (id) => {
						if (id.includes("node_modules")) {
							if (id.includes("@tanstack")) {
								return "vendor-tanstack";
							}
							if (id.includes("react")) {
								return "vendor-react";
							}
							if (id.includes("lexical")) {
								return "vendor-lexical";
							}
							return "vendor";
						}
					},
				},
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
			tailwindcss(),
			tanstackStart({}),
			viteReact(),
		],
	};
});

export default config;