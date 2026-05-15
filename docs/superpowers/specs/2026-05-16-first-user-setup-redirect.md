# First-User Setup: Route Redirect & Admin Registration Prompt

## Problem

When the system has no users, visitors should be forced to the sign-up page to create the initial ADMIN account. The existing server-side hook (`databaseHooks.user.create.before` in `packages/auth/src/index.ts`) already sets the first user as ADMIN.

## Design

### Files & Structure

```
features/auth/
├── functions/
│   └── auth.function.ts       # createServerFn → getIsFirstUserFn
├── queries/
│   └── auth.query.ts          # queryOptions → firstUserQueryOptions
├── components/
│   ├── sign-in-form.tsx
│   └── sign-up-form.tsx       # +isFirstUser prop
└── schemas/
    └── index.ts
```

### Components

#### 1. Server Function — `features/auth/functions/auth.function.ts`

`getIsFirstUserFn` — `createServerFn({ method: "GET" })` that queries `db.$count(schema.user)` and returns `{ isFirstUser: boolean }`.

#### 2. Query Options — `features/auth/queries/auth.query.ts`

`firstUserQueryOptions` — `queryOptions({ queryKey: ["first-user"], queryFn: getIsFirstUserFn })`.

#### 3. Route `_memos.tsx` — `beforeLoad`

Uses `context.queryClient.ensureQueryData(firstUserQueryOptions())`. If `isFirstUser`, throws `redirect({ to: "/sign-up" })`.

#### 4. Route `_auth/sign-in.tsx` — `beforeLoad`

Same redirect logic.

#### 5. Route `_auth/sign-up.tsx` — `loader`

Calls `ensureQueryData` and returns `{ isFirstUser }`. Component reads via `Route.useLoaderData()` and passes to `SignUpForm`.

#### 6. `sign-up-form.tsx` — `isFirstUser` prop

- `isFirstUser === true`: replaces "Already have an account? Sign In" with `m.auth_host_tip()` ("You are registering as the Site Host.")
- `isFirstUser === false`: keeps existing sign-in link

### Data Flow

```
Route navigation → beforeLoad → ensureQueryData → getIsFirstUserFn → DB count
                                                       ↓
                                            isFirstUser?
                                            ├─ true → redirect /sign-up
                                            └─ false → proceed as normal
```
