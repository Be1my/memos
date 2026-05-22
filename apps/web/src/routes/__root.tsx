import type { AuthUser } from "@memos/auth";
import { Toaster } from "@memos/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	redirect,
	Scripts,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { firstUserQueryOptions } from "@/features/auth/queries/auth.query";
import { startClock, stopClock } from "@/features/memos/stores/clock";
import { ThemeProvider } from "@/lib/theme-provider";
import { getLocale } from "@/paraglide/runtime";
import appCss from "../index.css?url";

const TanStackRouterDevtools = import.meta.env.DEV
	? lazy(() =>
			import("@tanstack/react-router-devtools").then((m) => ({
				default: m.TanStackRouterDevtools,
			})),
		)
	: () => null;

const ReactQueryDevtools = import.meta.env.DEV
	? lazy(() =>
			import("@tanstack/react-query-devtools").then((m) => ({
				default: m.ReactQueryDevtools,
			})),
		)
	: () => null;

export interface RouterAppContext {
	queryClient: QueryClient;
	user?: AuthUser | null;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	beforeLoad: async ({ context, location }) => {
		if (
			location.pathname === "/sign-up" ||
			location.pathname.startsWith("/api/")
		) {
			return;
		}
		const { isFirstUser } = await context.queryClient.ensureQueryData(
			firstUserQueryOptions(),
		);
		if (isFirstUser) {
			throw redirect({ to: "/sign-up" });
		}
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "My App",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	useEffect(() => {
		startClock();
		return stopClock;
	}, []);

	useEffect(() => {
		if (document.cookie.includes("memos-tz")) return;
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not widely supported
		document.cookie = `memos-tz=${tz}; path=/; maxAge=${60 * 60 * 24 * 365}`;
	}, []);

	return (
		<html lang={getLocale()} suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<ThemeProvider>
						<Outlet />
					</ThemeProvider>
				</div>
				<Toaster richColors />
				{import.meta.env.DEV && (
					<Suspense>
						<TanStackRouterDevtools position="bottom-right" />
						<ReactQueryDevtools initialIsOpen={false} />
					</Suspense>
				)}
				<Scripts />
			</body>
		</html>
	);
}
