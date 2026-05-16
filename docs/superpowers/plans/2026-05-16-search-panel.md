# Search Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a w-64 search panel between AppSidebar and SidebarInset with search box, activity calendar heatmap, and tags section.

**Architecture:** SearchPanel component inserted into the `_memos` layout. Filter params (q, date, tag) flow through URL search params → route loader → listMemos API. Calendar/tag stats come from a separate server function. Task 8 extends listMemosFn to accept filter args; other routes (explore, etc.) can opt in later.

**Tech Stack:** React 19, TanStack Router, TanStack React Query, Tailwind CSS v4, Drizzle ORM, Lucide icons

---

### Task 1: Create stats server function

**Files:**
- Create: `apps/web/src/features/memos/functions/list-memos-stats.function.ts`

- [ ] **Step 1: Create the file**

```ts
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const listMemosStatsFn = createServerFn({
	method: "GET",
	strict: false,
}).handler(async () => {
	const [
		{ createDb },
		{ memo },
		{ createAuth },
		{ getRequestHeaders: headers },
		{ sql },
	] = await Promise.all([
		import("@memos/db"),
		import("@memos/db/schema/memo.table"),
		import("@memos/auth"),
		import("@tanstack/react-start/server"),
		import("drizzle-orm"),
	]);

	const session = await createAuth().api.getSession({
		headers: headers(),
	});
	if (!session) {
		return { timestamps: [], tags: [] };
	}

	const db = createDb();

	const memos = await db
		.select({
			createdAt: memo.createdAt,
			tags: memo.tags,
		})
		.from(memo)
		.where(sql`${memo.creatorId} = ${session.user.id}`);

	const timestamps = memos.map((m) => m.createdAt.toISOString());

	const tagMap = new Map<string, number>();
	for (const m of memos) {
		for (const tag of m.tags) {
			tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
		}
	}
	const tags = Array.from(tagMap.entries())
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count);

	return { timestamps, tags };
});
```

### Task 2: Create stats query

**Files:**
- Create: `apps/web/src/features/memos/queries/memos-stats.query.ts`

- [ ] **Step 1: Create the file**

```ts
import { queryOptions } from "@tanstack/react-query";
import { listMemosStatsFn } from "../functions/list-memos-stats.function";

export const memosStatsQueryOptions = () =>
	queryOptions({
		queryKey: ["memos-stats"],
		queryFn: () => listMemosStatsFn(),
		staleTime: 30_000,
	});
```

### Task 3: Create SearchBox component

**Files:**
- Create: `apps/web/src/components/search-panel/search-box.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { Input } from "@memos/ui/components/input";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function SearchBox() {
	const { q: initialQ } = useSearch({ strict: false }) as { q?: string };
	const [value, setValue] = useState(initialQ ?? "");
	const navigate = useNavigate();

	useEffect(() => {
		setValue(initialQ ?? "");
	}, [initialQ]);

	useEffect(() => {
		const timer = setTimeout(() => {
			navigate({
				to: ".",
				search: (prev: Record<string, unknown>) => ({
					...prev,
					q: value || undefined,
					page: undefined,
				}),
				replace: true,
			});
		}, 300);
		return () => clearTimeout(timer);
	}, [value, navigate]);

	return (
		<div className="relative">
			<SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="搜索..."
				className="h-9 pl-8 pr-8 text-sm"
			/>
			{value && (
				<button
					type="button"
					onClick={() => setValue("")}
					className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
				>
					<XIcon className="size-4" />
				</button>
			)}
		</div>
	);
}
```

### Task 4: Create ActivityCalendar component

**Files:**
- Create: `apps/web/src/components/search-panel/activity-calendar.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = [
	"1月", "2月", "3月", "4月", "5月", "6月",
	"7月", "8月", "9月", "10月", "11月", "12月",
];

function getDayKey(year: number, month: number, day: number): string {
	return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getHeatColor(count: number, max: number): string {
	if (count === 0) return "bg-muted";
	const intensity = Math.min(Math.ceil((count / max) * 5), 5);
	const colors = [
		"",
		"bg-green-100 dark:bg-green-900/30",
		"bg-green-200 dark:bg-green-800/40",
		"bg-green-300 dark:bg-green-700/50",
		"bg-green-400 dark:bg-green-600/60",
		"bg-green-500 dark:bg-green-500/70",
	];
	return colors[intensity] ?? colors[5];
}

interface ActivityCalendarProps {
	timestamps: string[];
}

export function ActivityCalendar({ timestamps }: ActivityCalendarProps) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { date?: string };
	const now = new Date();
	const [currentMonth, setCurrentMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
	const [yearView, setYearView] = useState(false);

	const heatmap = useMemo(() => {
		const map = new Map<string, number>();
		for (const ts of timestamps) {
			const d = new Date(ts);
			const key = getDayKey(d.getFullYear(), d.getMonth(), d.getDate());
			map.set(key, (map.get(key) ?? 0) + 1);
		}
		return map;
	}, [timestamps]);

	const year = currentMonth.getFullYear();
	const month = currentMonth.getMonth();

	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const firstDayOfWeek = new Date(year, month, 1).getDay();
	const maxCount = Math.max(...Array.from(heatmap.values()), 1);

	const goToPrevMonth = useCallback(() => {
		setCurrentMonth(new Date(year, month - 1, 1));
	}, [year, month]);

	const goToNextMonth = useCallback(() => {
		setCurrentMonth(new Date(year, month + 1, 1));
	}, [year, month]);

	const goToMonth = useCallback((m: number) => {
		setCurrentMonth(new Date(year, m, 1));
		setYearView(false);
	}, [year]);

	const handleDayClick = useCallback(
		(day: number) => {
			const dateKey = getDayKey(year, month, day);
			navigate({
				to: ".",
				search: (prev: Record<string, unknown>) => ({
					...prev,
					date: prev.date === dateKey ? undefined : dateKey,
					tag: undefined,
				}),
				replace: true,
			});
		},
		[year, month, navigate],
	);

	const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

	const cells: React.ReactNode[] = [];
	for (let i = 0; i < firstDayOfWeek; i++) {
		cells.push(<div key={`empty-${i}`} />);
	}
	for (let day = 1; day <= daysInMonth; day++) {
		const key = getDayKey(year, month, day);
		const count = heatmap.get(key) ?? 0;
		const isToday = isCurrentMonth && day === now.getDate();
		const isSelected = search.date === key;

		cells.push(
			<button
				key={key}
				type="button"
				onClick={() => handleDayClick(day)}
				title={`${key}: ${count} 条`}
				className={`aspect-square w-full rounded-sm text-[10px] font-medium transition-colors ${getHeatColor(count, maxCount)} ${
					isSelected
						? "ring-2 ring-primary ring-offset-1"
						: isToday
							? "ring-1 ring-muted-foreground/50"
							: ""
				}`}
			>
				{day}
			</button>,
		);
	}

	return (
		<div className="space-y-2">
			{/* Navigation */}
			<div className="flex items-center justify-between">
				<button type="button" onClick={goToPrevMonth} className="p-1 text-muted-foreground hover:text-foreground">
					<ChevronLeftIcon className="size-4" />
				</button>
				<button
					type="button"
					onClick={() => setYearView(!yearView)}
					className="text-xs font-medium hover:text-primary"
				>
					{year} 年 {MONTHS[month]}
					{isCurrentMonth && <span className="ml-1 text-primary">•</span>}
				</button>
				<button type="button" onClick={goToNextMonth} className="p-1 text-muted-foreground hover:text-foreground">
					<ChevronRightIcon className="size-4" />
				</button>
			</div>

			{yearView ? (
				/* Year view */
				<div className="grid grid-cols-3 gap-1">
					{MONTHS.map((name, m) => {
						const isSelectedMonth = m === month;
						const isCurMonth = now.getFullYear() === year && now.getMonth() === m;
						return (
							<button
								key={m}
								type="button"
								onClick={() => goToMonth(m)}
								className={`rounded-md py-2 text-xs font-medium transition-colors ${
									isSelectedMonth
										? "bg-primary text-primary-foreground"
										: "hover:bg-accent"
								}`}
							>
								{name}
								{isCurMonth && <span className="ml-0.5">•</span>}
							</button>
						);
					})}
				</div>
			) : (
				<>
					{/* Weekday headers */}
					<div className="grid grid-cols-7 gap-px text-center text-[10px] text-muted-foreground">
						{WEEKDAYS.map((w) => (
							<div key={w} className="py-0.5">{w}</div>
						))}
					</div>
					{/* Day grid */}
					<div className="grid grid-cols-7 gap-px">
						{cells}
					</div>
				</>
			)}
		</div>
	);
}
```

### Task 5: Create Tags component

**Files:**
- Create: `apps/web/src/components/search-panel/tags.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";

interface TagItem {
	name: string;
	count: number;
}

interface TagsProps {
	tags: TagItem[];
}

export function Tags({ tags }: TagsProps) {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { tag?: string };

	const handleTagClick = useCallback(
		(name: string) => {
			navigate({
				to: ".",
				search: (prev: Record<string, unknown>) => ({
					...prev,
					tag: prev.tag === name ? undefined : name,
					date: undefined,
					q: undefined,
				}),
				replace: true,
			});
		},
		[navigate],
	);

	if (tags.length === 0) {
		return (
			<div className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
				暂无标签
			</div>
		);
	}

	return (
		<div className="flex flex-wrap gap-1.5">
			{tags.map((tag) => {
				const isSelected = search.tag === tag.name;
				return (
					<button
						key={tag.name}
						type="button"
						onClick={() => handleTagClick(tag.name)}
						className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
							isSelected
								? "border-primary bg-primary text-primary-foreground"
								: "border-border hover:bg-accent"
						}`}
					>
						{tag.name}
						<span className={`text-[10px] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
							{tag.count}
						</span>
					</button>
				);
			})}
		</div>
	);
}
```

### Task 6: Create SearchPanel container

**Files:**
- Create: `apps/web/src/components/search-panel/search-panel.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { SidebarSeparator } from "@memos/ui/components/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { memosStatsQueryOptions } from "@/features/memos/queries/memos-stats.query";
import { ActivityCalendar } from "./activity-calendar";
import { SearchBox } from "./search-box";
import { Tags } from "./tags";

export function SearchPanel() {
	const { data: stats } = useSuspenseQuery(memosStatsQueryOptions());

	return (
		<div className="flex w-64 shrink-0 flex-col gap-4 overflow-auto border-r p-3">
			<SearchBox />
			<SidebarSeparator className="mx-0" />
			<div className="space-y-1">
				<h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
					活动日历
				</h3>
				<ActivityCalendar timestamps={stats.timestamps} />
			</div>
			<SidebarSeparator className="mx-0" />
			<div className="space-y-1">
				<h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
					标签
				</h3>
				<Tags tags={stats.tags} />
			</div>
		</div>
	);
}
```

### Task 7: Integrate into `_memos.tsx` layout

**Files:**
- Modify: `apps/web/src/routes/_memos.tsx:25-35`
- Modify: `apps/web/src/routes/_memos/home.tsx` (preload stats data in loader)

- [ ] **Step 1: Modify `_memos.tsx` to add SearchPanel**

Replace the layout to include `SearchPanel` between AppSidebar and SidebarInset:

```tsx
import { SidebarInset, SidebarProvider } from "@memos/ui/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SearchPanel } from "@/components/search-panel/search-panel";
import { getSessionFn } from "@/functions/get-session";

const protectedPaths = [
	"/home",
	"/inbox",
	"/attachments",
	"/archived",
	"/settings",
];

export const Route = createFileRoute("/_memos")({
	beforeLoad: async ({ location }) => {
		const session = await getSessionFn();
		if (!session && protectedPaths.includes(location.pathname)) {
			throw redirect({ to: "/sign-in" });
		}
		return { user: session?.user ?? null };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useRouteContext();
	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			<SearchPanel />
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
```

Note: The SearchPanel uses `useSuspenseQuery` which requires a `<Suspense>` boundary. Since `SidebarProvider` wraps the whole layout and `SearchPanel` is inside it, we need to add a Suspense boundary for the stats loading state.

- [ ] **Step 2: Wrap SearchPanel in Suspense**

Update the layout to handle loading state:

```tsx
import { Suspense } from "react";
// ... other imports

function RouteComponent() {
	const { user } = Route.useRouteContext();
	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			<Suspense
				fallback={
					<div className="flex w-64 shrink-0 flex-col gap-4 border-r p-3">
						<div className="h-9 animate-pulse rounded-md bg-muted" />
						<div className="h-48 animate-pulse rounded-md bg-muted" />
					</div>
				}
			>
				<SearchPanel />
			</Suspense>
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
```

### Task 8: Extend listMemosFn with filter params and wire up home.tsx

**Files:**
- Modify: `apps/web/src/features/editor/functions/list-memos.function.ts`
- Modify: `apps/web/src/features/editor/queries/memos.query.ts`
- Modify: `apps/web/src/routes/_memos/home.tsx`

- [ ] **Step 1: Extend `listMemosFn` to accept filter parameters**

```tsx
import { createServerFn } from "@tanstack/react-start";

interface ListMemosFilter {
	q?: string;
	date?: string;
	tag?: string;
}

export const listMemosFn = createServerFn({
	method: "GET",
	strict: false,
}).handler(async (data: unknown) => {
	const filter = (data ?? {}) as ListMemosFilter;

	const [
		{ createDb },
		{ memo },
		{ createAuth },
		{ getRequestHeaders },
		{ desc, eq, like, sql, and },
	] = await Promise.all([
		import("@memos/db"),
		import("@memos/db/schema/memo.table"),
		import("@memos/auth"),
		import("@tanstack/react-start/server"),
		import("drizzle-orm"),
	]);

	const headers = getRequestHeaders();
	const session = await createAuth().api.getSession({ headers });

	const db = createDb();

	const conditions = [eq(memo.creatorId, session?.user.id ?? "")];

	if (filter.q) {
		conditions.push(like(memo.content, `%${filter.q}%`));
	}

	if (filter.date) {
		const start = new Date(filter.date);
		const end = new Date(start);
		end.setDate(end.getDate() + 1);
		conditions.push(
			sql`${memo.createdAt} >= ${start} AND ${memo.createdAt} < ${end}`,
		);
	}

	if (filter.tag) {
		conditions.push(sql`${filter.tag} = ANY(${memo.tags})`);
	}

	const memos = await db
		.select()
		.from(memo)
		.where(and(...conditions))
		.orderBy(desc(memo.createdAt))
		.limit(20);

	return memos.map((m) => ({
		id: m.id,
		uid: m.uid,
		content: m.content,
		payload: m.payload,
		visibility: m.visibility,
		tags: m.tags,
		createdAt: m.createdAt.toISOString(),
	}));
});
```

- [ ] **Step 2: Update `memos.query.ts` to accept filter**

```tsx
import { queryOptions } from "@tanstack/react-query";
import { listMemosFn } from "../functions/list-memos.function";

interface MemosFilter {
	q?: string;
	date?: string;
	tag?: string;
}

export const memosQueryOptions = (filter?: MemosFilter) =>
	queryOptions({
		queryKey: ["memos", filter],
		queryFn: () => listMemosFn(filter),
	});
```

- [ ] **Step 3: Update `home.tsx` to use search params and pass them to loader**

```tsx
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Editor } from "@/features/editor/components/editor";
import { MemoList } from "@/features/editor/components/memo-list";
import { createMemoFn } from "@/features/editor/functions/create-memo.function";
import { memosQueryOptions } from "@/features/editor/queries/memos.query";
import { z } from "zod";

const searchSchema = z.object({
	q: z.string().optional(),
	date: z.string().optional(),
	tag: z.string().optional(),
});

export const Route = createFileRoute("/_memos/home")({
	validateSearch: searchSchema,
	loaderDeps: ({ search: { q, date, tag } }) => ({ q, date, tag }),
	loader: async ({ context: { queryClient }, deps: { q, date, tag } }) => {
		const filter = { q, date, tag };
		const memos = await queryClient.ensureQueryData(memosQueryOptions(filter));
		return { memos, filter };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const [resetKey, setResetKey] = useState(0);
	const queryClient = useQueryClient();
	const { filter } = Route.useLoaderData();
	const { data: memos } = useSuspenseQuery(memosQueryOptions(filter));

	const mutation = useMutation({
		mutationFn: createMemoFn,
		onSuccess: () => {
			toast.success("已保存");
			queryClient.invalidateQueries({ queryKey: ["memos"] });
			setResetKey((k) => k + 1);
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "保存失败");
		},
	});

	return (
		<div className="mx-auto w-full max-w-2xl px-4 pt-8">
			<Editor
				key={resetKey}
				isSaving={mutation.isPending}
				onSave={(data) => mutation.mutate({ data })}
			/>
			<MemoList memos={memos} />
		</div>
	);
}
```

### Task 9: Verify the build

- [ ] **Step 1: Run typecheck and build**

```bash
cd apps/web && npx tsc --noEmit
```
