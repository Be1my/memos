# First-User Setup Redirect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Intercept all routes when no users exist, redirect to /sign-up with admin registration prompt.

**Architecture:** Server function checks DB user count. Route `beforeLoad` hooks use TanStack Query's `ensureQueryData` to fetch the flag and redirect. Sign-up form conditionally shows host registration text.

**Tech Stack:** TanStack React Start (createServerFn), TanStack Query (queryOptions/ensureQueryData), TanStack Router (beforeLoad/loader/redirect), better-auth, Drizzle ORM, Paraglide i18n

---

### Task 1: Create server function

**Files:**
- Create: `features/auth/functions/auth.function.ts`

- [ ] **Step 1: Create the server function file**

```ts
import { createServerFn } from "@tanstack/react-start";
import { createDb } from "@memos/db";
import * as schema from "@memos/db/schema/auth.table";

export const getIsFirstUserFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const db = createDb();
		const count = await db.$count(schema.user);
		return { isFirstUser: count === 0 };
	},
);
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No errors related to `features/auth/functions/auth.function.ts` (pre-existing vite.config.ts error is fine)

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/auth/functions/auth.function.ts
git commit -m "feat: add getIsFirstUserFn server function"
```

---

### Task 2: Create query options

**Files:**
- Create: `features/auth/queries/auth.query.ts`

- [ ] **Step 1: Create the query options file**

```ts
import { queryOptions } from "@tanstack/react-query";
import { getIsFirstUserFn } from "../functions/auth.function";

export const firstUserQueryOptions = () =>
	queryOptions({
		queryKey: ["first-user"],
		queryFn: () => getIsFirstUserFn(),
	});
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/auth/queries/auth.query.ts
git commit -m "feat: add firstUserQueryOptions"
```

---

### Task 3: Add route guard to _memos layout

**Files:**
- Modify: `routes/_memos.tsx`

- [ ] **Step 1: Add beforeLoad to _memos.tsx**

Current file:
```tsx
import { SidebarInset, SidebarProvider } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/_memos")({
	component: RouteComponent,
});
```

Replace with:
```tsx
import { SidebarInset, SidebarProvider } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { firstUserQueryOptions } from "@/features/auth/queries/auth.query";

export const Route = createFileRoute("/_memos")({
	beforeLoad: async ({ context }) => {
		const { isFirstUser } =
			await context.queryClient.ensureQueryData(firstUserQueryOptions());
		if (isFirstUser) {
			throw redirect({ to: "/sign-up" });
		}
	},
	component: RouteComponent,
});
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/_memos.tsx
git commit -m "feat: redirect _memos routes to /sign-up when no users exist"
```

---

### Task 4: Add route guard to sign-in route

**Files:**
- Modify: `routes/_auth/sign-in.tsx`

- [ ] **Step 1: Add beforeLoad to sign-in.tsx**

Current file:
```tsx
import { createFileRoute } from "@tanstack/react-router";
import SignInForm from "@/features/auth/components/sign-in-form";

export const Route = createFileRoute("/_auth/sign-in")({
    component: RouteComponent,
});

function RouteComponent() {
    return <SignInForm />;
}
```

Replace with:
```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import SignInForm from "@/features/auth/components/sign-in-form";
import { firstUserQueryOptions } from "@/features/auth/queries/auth.query";

export const Route = createFileRoute("/_auth/sign-in")({
	beforeLoad: async ({ context }) => {
		const { isFirstUser } =
			await context.queryClient.ensureQueryData(firstUserQueryOptions());
		if (isFirstUser) {
			throw redirect({ to: "/sign-up" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <SignInForm />;
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/_auth/sign-in.tsx
git commit -m "feat: redirect sign-in to sign-up when no users exist"
```

---

### Task 5: Add loader to sign-up route

**Files:**
- Modify: `routes/_auth/sign-up.tsx`

- [ ] **Step 1: Add loader to sign-up.tsx**

Current file:
```tsx
import { createFileRoute } from "@tanstack/react-router";
import SignUpForm from "@/features/auth/components/sign-up-form";

export const Route = createFileRoute("/_auth/sign-up")({
	component: RouteComponent,
});

function RouteComponent() {
	return <SignUpForm />;
}
```

Replace with:
```tsx
import { createFileRoute } from "@tanstack/react-router";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { firstUserQueryOptions } from "@/features/auth/queries/auth.query";

export const Route = createFileRoute("/_auth/sign-up")({
	loader: async ({ context }) => {
		const { isFirstUser } =
			await context.queryClient.ensureQueryData(firstUserQueryOptions());
		return { isFirstUser };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { isFirstUser } = Route.useLoaderData();
	return <SignUpForm isFirstUser={isFirstUser} />;
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/_auth/sign-up.tsx
git commit -m "feat: pass isFirstUser flag to sign-up form via route loader"
```

---

### Task 6: Update sign-up form with isFirstUser prop

**Files:**
- Modify: `features/auth/components/sign-up-form.tsx`

- [ ] **Step 1: Add isFirstUser prop and conditional footer**

Add `isFirstUser` prop to the interface and `defaultProps`:

```tsx
interface SignUpFormProps {
	redirectPath?: string;
	isFirstUser?: boolean;
}
```

Replace the footer section (lines 194-204):

```tsx
			<div className="mt-4 flex w-full flex-row items-center justify-center">
				{isFirstUser ? (
					<p className="text-muted-foreground text-sm">
						{m.auth_host_tip()}
					</p>
				) : (
					<p className="text-muted-foreground text-sm">
						{m.auth_sign_in_tip()}
						<Link
							to="/sign-in"
							className="ml-1 text-foreground underline underline-offset-2 hover:opacity-70"
						>
							{m.common_sign_in()}
						</Link>
					</p>
				)}
			</div>
```

The full component signature becomes:
```tsx
export default function SignUpForm({ redirectPath, isFirstUser }: SignUpFormProps) {
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Verify biome**

Run: `npx biome check apps/web/src/features/auth/components/sign-up-form.tsx apps/web/src/routes/_auth/sign-up.tsx apps/web/src/routes/_auth/sign-in.tsx apps/web/src/routes/_memos.tsx apps/web/src/features/auth/functions/auth.function.ts apps/web/src/features/auth/queries/auth.query.ts`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/auth/components/sign-up-form.tsx
git commit -m "feat: show host registration prompt on sign-up when no users exist"
```
