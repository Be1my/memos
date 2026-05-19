# Memo Card Relative Time Display — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace absolute timestamps on MemoCard with locale-aware relative time display.

**Architecture:** Server returns `createdAt`/`updatedAt` ISO strings; client computes delta and formats via Paraglide message formatters (`relativetime`/`datetime`); a Zustand store provides a global 60s tick for re-evaluation; a `MemoTimeDisplay` component handles threshold logic and tooltip.

**Tech Stack:** React 19, zustand 5, inlang Paraglide JS, date-fns, TanStack Start

---

### Task 1: Create Zustand clock store

**Files:**
- Create: `apps/web/src/stores/clock.ts`

- [ ] **Step 1: Create the store**

```ts
import { create } from "zustand";

interface ClockStore {
  tick: number;
}

const useClockStore = create<ClockStore>(() => ({ tick: 0 }));

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startClock() {
  if (intervalId) return;
  intervalId = setInterval(() => {
    useClockStore.setState({ tick: Date.now() });
  }, 60_000);
}

export function stopClock() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export { useClockStore };
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/stores/clock.ts
git commit -m "feat: add zustand clock store for relative time ticks"
```

---

### Task 2: Add Paraglide messages for time display

**Files:**
- Modify: `apps/web/messages/en.json`
- Modify: `apps/web/messages/zh-Hans.json`

- [ ] **Step 1: Add English time messages**

Append to `apps/web/messages/en.json` (before the closing `}`):

```json
	"time_now": "now",
	"time_minutes_ago": "{minutes, relativetime, unit=minute, style=short, numeric=always}",
	"time_hours_ago": "{hours, relativetime, unit=hour, style=short, numeric=always}",
	"time_date": "{date, datetime, weekday=short, month=short, day=numeric, year=numeric}",
	"time_last_updated": "Last updated at {time}",
	"time_created_tooltip": "Created: {time}",
	"time_updated_tooltip": "Last updated: {time}"
```

- [ ] **Step 2: Add Chinese time messages**

Append to `apps/web/messages/zh-Hans.json` (before the closing `}`):

```json
	"time_now": "刚刚",
	"time_minutes_ago": "{minutes, relativetime, unit=minute, style=short, numeric=always}",
	"time_hours_ago": "{hours, relativetime, unit=hour, style=short, numeric=always}",
	"time_date": "{date, datetime, weekday=short, month=short, day=numeric, year=numeric}",
	"time_last_updated": "最后更新于 {time}",
	"time_created_tooltip": "创建时间：{time}",
	"time_updated_tooltip": "最后更新：{time}"
```

- [ ] **Step 3: Run Paraglide to regenerate message functions**

```bash
bun run --cwd apps/web machine-translate
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/messages/en.json apps/web/messages/zh-Hans.json
git commit -m "feat: add i18n messages for relative time display"
```

---

### Task 3: Add `updatedAt` to server response

**Files:**
- Modify: `apps/web/src/features/editor/functions/list-memos.shared.ts`
- Modify: `apps/web/src/features/editor/functions/list-memos.function.ts`
- Modify: `apps/web/src/features/editor/functions/list-explore-memos.function.ts`

- [ ] **Step 1: Add `updatedAt` to the shared query return**

In `list-memos.shared.ts`, add `updatedAt` to the returned object at line 108:

```ts
		createdAt: m.createdAt.toISOString(),
		updatedAt: m.updatedAt.toISOString(),
```

- [ ] **Step 2: Drop `formattedTime` from `list-memos.function.ts`**

Remove the `timeZone` variable and the `.map()` call — `updatedAt` is already included via the spread from `queryMemos`.

Replace:
```ts
	const timeZone = parseTimezoneFromHeaders(headers);
	return memos.map((m) => ({
		...m,
		formattedTime: format(
			new TZDate(m.createdAt, timeZone),
			"yyyy/MM/dd HH:mm",
		),
	}));
```

With:
```ts
	return memos;
```

Also remove unused imports: `import { TZDate } from "@date-fns/tz";`, `import { format } from "date-fns";`, and `import { parseTimezoneFromHeaders } from "@/lib/parse-timezone-from-headers";`.

- [ ] **Step 3: Drop `formattedTime` from `list-explore-memos.function.ts`**

Same change — remove `timeZone` and `.map()`, remove unused imports.

Replace:
```ts
	const timeZone = parseTimezoneFromHeaders(headers);
	return memos.map((m) => ({
		...m,
		formattedTime: format(new TZDate(m.createdAt, timeZone), "yyyy/MM/dd HH:mm"),
	}));
```

With:
```ts
	return memos;
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/editor/functions/list-memos.shared.ts apps/web/src/features/editor/functions/list-memos.function.ts apps/web/src/features/editor/functions/list-explore-memos.function.ts
git commit -m "feat: add updatedAt to memo list server response"
```

---

### Task 4: Create MemoTimeDisplay component

**Files:**
- Create: `apps/web/src/features/memos/components/memo-time-display.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { useClockStore } from "@/stores/clock";

function toDelta(isoString: string, now: number) {
  const date = new Date(isoString);
  return Math.floor((now - date.getTime()) / 1000);
}

function formatRelative(isoString: string, now: number) {
  const delta = toDelta(isoString, now);

  if (delta < 60) {
    return m.time_now();
  }

  if (delta < 3600) {
    return m.time_minutes_ago({ minutes: -Math.floor(delta / 60) });
  }

  if (delta < 86400) {
    return m.time_hours_ago({ hours: -Math.floor(delta / 3600) });
  }

  return m.time_date({ date: new Date(isoString) });
}

function MemoTimeDisplay({
  createdAt,
  updatedAt,
}: {
  createdAt: string;
  updatedAt: string;
}) {
  const tick = useClockStore((s) => s.tick);
  const now = tick || Date.now();

  const isUpdated = createdAt !== updatedAt;
  const timeText = formatRelative(updatedAt, now);

  const locale = getLocale();
  const createdFormatted = new Date(createdAt).toLocaleString(locale);
  const updatedFormatted = new Date(updatedAt).toLocaleString(locale);

  return (
    <span
      className="cursor-help"
      title={`${m.time_created_tooltip({ time: createdFormatted })}\n${m.time_updated_tooltip({ time: updatedFormatted })}`}
    >
      {isUpdated ? m.time_last_updated({ time: timeText }) : timeText}
    </span>
  );
}

export { MemoTimeDisplay };
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/memos/components/memo-time-display.tsx
git commit -m "feat: add MemoTimeDisplay component with relative time"
```

---

### Task 5: Integrate MemoTimeDisplay into MemoCard

**Files:**
- Modify: `apps/web/src/features/memos/components/memo-card.tsx`

- [ ] **Step 1: Replace FormattedTime with MemoTimeDisplay**

In `memo-card.tsx`:
- Remove the `FormattedTime` function (lines 18-20)
- Add import: `import { MemoTimeDisplay } from "./memo-time-display";`
- Replace `<FormattedTime formattedTime={memo.formattedTime} />` with `<MemoTimeDisplay createdAt={memo.createdAt} updatedAt={memo.updatedAt} />`

The old code:
```tsx
function FormattedTime({ formattedTime }: { formattedTime: string }) {
	return <>{formattedTime}</>;
}
```

Replace usage at line 39:
```tsx
<MemoTimeDisplay createdAt={memo.createdAt} updatedAt={memo.updatedAt} />
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/memos/components/memo-card.tsx
git commit -m "feat: integrate MemoTimeDisplay into MemoCard"
```

---

### Task 6: Wire clock lifecycle in root layout

**Files:**
- Modify: `apps/web/src/routes/__root.tsx`

- [ ] **Step 1: Start/stop clock in root layout**

Add imports:
```ts
import { startClock, stopClock } from "@/stores/clock";
```

Add effect in the root layout component:
```tsx
useEffect(() => {
  startClock();
  return stopClock;
}, []);
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/routes/__root.tsx
git commit -m "feat: wire clock lifecycle in root layout"
```
