# Activity Calendar Refactoring

## Goal

Split the monolithic `activity-calendar.tsx` (317 lines) into smaller, single-responsibility files to improve readability and maintainability.

## File Structure

```
activity-calendar/
├── index.tsx           → Main component: month state, navigation, orchestrates sub-components
├── use-heatmap.ts      → Hook: computes heatmap Map<string, number> from timestamps prop
├── calendar-utils.ts   → Constants (WEEKDAYS, MONTHS) + pure utility functions
├── calendar-cell.tsx   → Single day cell: heat color + tooltip + click handler
├── month-grid.tsx      → 7-column month grid: current-month days + prev/next padding
└── year-view.tsx       → Dialog with 12 mini month grids for year overview
```

## Responsibilities

| File | What it owns |
|------|-------------|
| `index.tsx` | `currentMonth` state, `yearView` state, `goToPrevMonth`/`goToNextMonth`, `handleDayClick`, renders header + `MonthGrid` + `YearView` |
| `use-heatmap` | `useMemo` computing `Map<string, number>` from `timestamps`, memoized on timestamps |
| `calendar-utils` | `WEEKDAYS`, `MONTHS`, `getHeatColor(count, max)` → tailwind class |
| `calendar-cell` | `CalendarCell({ date, count, maxCount, isToday, onClick })` button with tooltip and heat color |
| `month-grid` | `MonthGrid({ year, month, heatmap, maxCount })` renders 7xN grid with padding days and `CalendarCell` for each |
| `year-view` | `YearView({ year, heatmap, maxCount, open, onOpenChange, onMonthSelect })` dialog with grid of 12 `MonthGrid`s |

## Data Flow

```
search-panel.tsx
  → <ActivityCalendar timestamps={stats} />
    → use-heatmap(timestamps) → { heatmap, maxCount }
    → <MonthGrid year month heatmap maxCount />
      → <CalendarCell ... /> (× days)
    → <YearView year heatmap maxCount open onOpenChange />
      → <MonthGrid year month heatmap maxCount /> (× 12)
```

## Interface Preservation

`search-panel.tsx` import path stays as `./activity-calendar` via an `index.tsx` that re-exports from `./activity-calendar/index.tsx`.

## Non-Goals

- No behavior changes
- No style changes
- No prop interface changes
- No new dependencies
