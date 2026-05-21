import { Toaster } from "@memos/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	redirect,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { firstUserQueryOptions } from "@/features/auth";
import { startClock, stopClock } from "@/features/memos";
import { ThemeProvider } from "@/lib/theme-provider";
import { getLocale } from "@/paraglide/runtime";
import appCss from "../index.css?url";

export interface RouterAppContext {
	queryClient: QueryClient;
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
				<TanStackRouterDevtools position="bottom-right" />
				<ReactQueryDevtools initialIsOpen={false} />
				<Scripts />
			</body>
		</html>
	);
}
