# Settings Page Design

## Overview

Add a full settings page at `/settings` and restructure the main layout so that `SearchPanel` is controlled per-page rather than globally.

## Routing Restructure

### Current
`_memos.tsx` renders `SidebarProvider + AppSidebar + SearchPanel + Outlet` — all pages under this layout get SearchPanel.

### New
`_memos.tsx` renders only `SidebarProvider + AppSidebar + Outlet`.

Each page decides independently:
- **Pages that need SearchPanel** (home, explore, profile, archived): render `<SearchPanel />` + `<SidebarInset>` as siblings inside their component.
- **Pages that don't need SearchPanel** (settings, inbox, attachments, about): render only `<SidebarInset>`.

No route file moves are required.

## Settings Page UI

A single Card layout with two-pane structure:

```
┌─────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────────────────┐ │
│  │ My Account│  │   (content area)     │ │
│  │           │  │                      │ │
│  │ Preferences│  │                      │ │
│  └──────────┘  └──────────────────────┘ │
└─────────────────────────────────────────┘
```

Left side: two navigation buttons stacked vertically. Active state highlighted.
Right side: content changes based on selected nav item.

### My Account Section

- **Avatar**: circular avatar preview, hover overlay "更换" button, clicking opens file picker.
- **Change Password**: form with old password, new password, confirm new password fields.
- **Delete Account**: red destructive button, opens confirmation dialog.

### Preferences Section

Two sub-sections separated by a divider:

**Appearance**
- **Language**: dropdown select, options from paraglide `locales` (en, zh-Hans).
- **Theme**: dropdown select, options from `ThemeProvider` (light, dark, paper, system).

**Memo Defaults**
- **Default Visibility**: dropdown select with options private / protected / public.

## Technical Details

- Uses existing `@memos/ui` Card component and other UI primitives.
- Language switching via paraglide's `setLocale()` + `loadLocale()`.
- Theme switching via `useTheme()` from `ThemeProvider`.
- Avatar uses existing file upload API routes.
- Password change and account deletion use Better Auth client.
- User data loaded via existing `useAuthQuery()` or context.
