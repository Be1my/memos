# Search Panel Design

## Overview

Add a `w-64` search panel between `AppSidebar` and `SidebarInset` in the `_memos` layout, containing three sections: SearchBox, ActivityCalendar (heatmap), and Tags.

## Layout

```
SidebarProvider
  AppSidebar
  SearchPanel (w-64, border-r, shrink-0, flex flex-col, overflow-auto)
    ├─ SearchBox
    ├─ SidebarSeparator
    ├─ ActivityCalendar
    ├─ SidebarSeparator
    └─ Tags
  SidebarInset
    Outlet
```

- Panel is always visible, does not collapse with sidebar
- Separators between each section

## Data Sources

### Independent Stats API
Endpoint returning aggregated stats for calendar and tags:

```ts
{ timestamps: number[]; tags: { name: string; count: number }[] }
```

- `timestamps`: millisecond timestamps of all user memos (for calendar aggregation)
- `tags`: tag names with their count, sorted by count descending

React Query key: `["memos-stats"]`

### URL Search Params
Used for filtering the memo list via `listMemos` API:

| Param  | Type   | Description                     |
|--------|--------|---------------------------------|
| `q`    | string | Search keyword (from SearchBox) |
| `date` | string | Date in `YYYY-MM-DD` format     |
| `tag`  | string | Tag name                        |

Changes to these params trigger a re-fetch of the memos list (via TanStack Router search params + loader).

## Section 1: SearchBox

- Input with search icon at top of panel
- Reads initial value from `useSearch().q`
- On input: 300ms debounce, then `navigate({ search: { ...prev, q: value, page: undefined } })`
- Clear button appears when input has value
- Clearing removes `q` param

## Section 2: ActivityCalendar

### Data Processing
- Frontend aggregates `timestamps` into `Map<dayKey, count>` by month
- Current month is derived from system date or from `date` param in URL

### Monthly Grid
- 7-column grid (Sun–Sat), each cell is a day square
- 5-level color intensity based on count:
  - `count=0`: gray/low-opacity background
  - `count>0`: progressive intensity, max = highest in month
- Click day → set `?date=YYYY-MM-DD` in URL, clear `?tag` param
- Selected day has distinct style (ring/border)

### Navigation
- Left/right arrow buttons to change month
- Current month name displayed as a button in center
- Click month name → expand to year view (12-month grid)
  - Click a month → collapse back to monthly view
- Current month has dot marker; selected month has distinct style

### Month-Year Navigation
When clicking the month name button:
- Monthly grid transitions to a year grid showing 12 months
- Each month cell shows month name
- Current month marked with dot indicator
- Clicking a month collapses back to monthly view for that month

### Props/State
- `currentMonth: Date` — which month to display
- `calendarData: { dateKey: string; count: number }[]` — memo counts by date

## Section 3: Tags

### Display
- Show top tags as a list of items
- Each item: tag name + count badge
- Tag display is row-wrapping (`flex flex-wrap`)
- Show 2 rows of tags with item styling (border rounded)
- Empty state: "暂无标签" placeholder with dashed border

### Interaction
- Click tag → set `?tag=xxx` in URL, clear `?date` and `?q` params
- Click already-selected tag → remove `?tag` param
- Selected tag has filled background style
- Non-selected tags have border-only style

## Implementation Order

1. Create SearchPanel component with layout structure
2. Implement SearchBox with debounce + URL params
3. Implement ActivityCalendar (month grid, heatmap, navigation)
4. Implement Tags list
5. Add stats API call via React Query
6. Wire URL search params into listMemos filter
7. Integrate into `_memos.tsx` layout
