import { createRouter as createTanStackRouter, ErrorComponent } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import Loader from "./components/loader";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
	const queryClient = new QueryClient();

	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		context: { queryClient },
		defaultPendingComponent: () => <Loader />,
		defaultNotFoundComponent: () => <div>Not Found</div>,
		defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
};

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
