# Memo Card Relative Time Display

## Problem

MemoCard currently displays absolute timestamps (`2026/05/20 14:30`) regardless of age. Need relative time display with locale awareness.

## Requirements

- Within 1 minute → "now" / "刚刚"
- Within 1 hour → "Xm ago" / "X分钟前"
- Within today (24h) → "Xh ago" / "X小时前"
- Beyond 24h → absolute date like "Wed, May 20, 2026"
- If `updatedAt !== createdAt`, prefix with "Last updated at"
- Hover tooltip shows both "Created:" and "Last updated:" with full timestamps
- i18n support (en / zh-Hans)

## Architecture

### Data Flow

```
Server (date-fns TZDate) → ISO strings → Client → Paraglide msg formatters → UI
```

Server functions already return `createdAt` as ISO string. Add `updatedAt` to the returned shape.

### Zustand Tick Store

Global 60s interval clock used by MemoTimeDisplay to re-evaluate relative times. Started in root layout, stopped on unmount.

`apps/web/src/stores/clock.ts`

```ts
import { create } from "zustand";

interface ClockStore { tick: number }
const useClockStore = create<ClockStore>(() => ({ tick: 0 }));

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startClock() {
  if (intervalId) return;
  intervalId = setInterval(() => {
    useClockStore.setState({ tick: Date.now() });
  }, 60_000);
}

export function stopClock() {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
}

export { useClockStore };
```

### Paraglide Messages

Uses built-in `relativetime` and `datetime` formatters for locale-aware output.

```json
// messages/en.json
"time_now": "now",
"time_minutes_ago": "{minutes, relativetime, unit=minute, style=short, numeric=always}",
"time_hours_ago": "{hours, relativetime, unit=hour, style=short, numeric=always}",
"time_date": "{date, datetime, weekday=short, month=short, day=numeric, year=numeric}",
"time_last_updated": "Last updated at {time}",
"time_created_tooltip": "Created: {time}",
"time_updated_tooltip": "Last updated: {time}"
```

zh-Hans translations mirror same structure; `relativetime` outputs "5分钟前", `datetime` outputs "2026年5月20日周三".

### MemoTimeDisplay Component

New component at `apps/web/src/features/memos/components/memo-time-display.tsx`.

- Subscribes to `useClockStore.tick`
- Computes delta between `updatedAt` and now
- Threshold logic:
  - `delta < 1min` → call `m.time_now()`
  - `delta < 60min` → call `m.time_minutes_ago({ minutes: -n })`
  - `delta < 24h` → call `m.time_hours_ago({ hours: -n })`
  - `>= 24h` → call `m.time_date({ date: new Date(updatedAt) })`
- If `updatedAt !== createdAt`, wrap with `m.time_last_updated()`
- Tooltip (hover element): `m.time_created_tooltip()` + `m.time_updated_tooltip()`

### Server Changes

`list-memos.shared.ts`: add `updatedAt: m.updatedAt.toISOString()` to returned objects.

`list-memos.function.ts` / `list-explore-memos.function.ts`: add `updatedAt` to destructured fields; remove `formattedTime` formatting.

### Component Replacement

In `memo-card.tsx`, replace:
```tsx
<FormattedTime formattedTime={memo.formattedTime} />
```
with:
```tsx
<MemoTimeDisplay createdAt={memo.createdAt} updatedAt={memo.updatedAt} />
```

### Files Changed

| File | Change |
|------|--------|
| `apps/web/src/stores/clock.ts` | New |
| `apps/web/messages/en.json` | Add 7 messages |
| `apps/web/messages/zh-Hans.json` | Add 7 messages |
| `apps/web/src/features/editor/functions/list-memos.shared.ts` | Add `updatedAt` to return |
| `apps/web/src/features/editor/functions/list-memos.function.ts` | Add `updatedAt`, drop `formattedTime` |
| `apps/web/src/features/editor/functions/list-explore-memos.function.ts` | Add `updatedAt`, drop `formattedTime` |
| `apps/web/src/features/memos/components/memo-time-display.tsx` | New |
| `apps/web/src/features/memos/components/memo-card.tsx` | Replace time display |
