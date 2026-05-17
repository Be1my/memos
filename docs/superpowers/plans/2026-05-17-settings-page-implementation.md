# Settings Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full settings page at `/settings` and move SearchPanel from the global layout to individual pages.

**Architecture:** Remove `SearchPanel` from `_memos.tsx` layout so each page controls its own chrome. Pages that need SearchPanel (home, explore, archived, profile) render `<SearchPanel />` + `<SidebarInset>`; pages without it (settings, inbox, attachments, about) render only `<SidebarInset>`. The settings page is a two-pane card with a left nav (My Account / Preferences).

**Tech Stack:** TanStack Router, Tailwind CSS v4, Base UI, @memos/ui components, better-auth, paraglide (i18n), lucide-react.

---

### Task 1: Remove SearchPanel from global layout

**Files:**
- Modify: `apps/web/src/routes/_memos.tsx`

- [ ] **Remove SearchPanel and SidebarInset from _memos.tsx**

  Change from:
  ```tsx
  import { SidebarInset, SidebarProvider } from "@memos/ui/components/sidebar";
  import { createFileRoute, Outlet } from "@tanstack/react-router";
  import { AppSidebar } from "@/components/app-sidebar";
  import { SearchPanel } from "@/components/search-panel/search-panel";
  import { memosStatsQueryOptions } from "@/features/memos/queries/memos-stats.query";
  import { getSessionFn } from "@/functions/get-session";

  export const Route = createFileRoute("/_memos")({
  	beforeLoad: async ({ context: { queryClient } }) => {
  		const session = await getSessionFn();
  		if (session?.user) {
  			await queryClient.prefetchQuery(memosStatsQueryOptions());
  		}
  		return { user: session?.user ?? null };
  	},
  	component: RouteComponent,
  });

  function RouteComponent() {
  	const { user } = Route.useRouteContext();
  	return (
  		<SidebarProvider className="h-svh">
  			<AppSidebar user={user} />
  			<SearchPanel />
  			<SidebarInset className="overflow-y-auto">
  				<Outlet />
  			</SidebarInset>
  		</SidebarProvider>
  	);
  }
  ```

  To:
  ```tsx
  import { SidebarProvider } from "@memos/ui/components/sidebar";
  import { createFileRoute, Outlet } from "@tanstack/react-router";
  import { AppSidebar } from "@/components/app-sidebar";
  import { memosStatsQueryOptions } from "@/features/memos/queries/memos-stats.query";
  import { getSessionFn } from "@/functions/get-session";

  export const Route = createFileRoute("/_memos")({
  	beforeLoad: async ({ context: { queryClient } }) => {
  		const session = await getSessionFn();
  		if (session?.user) {
  			await queryClient.prefetchQuery(memosStatsQueryOptions());
  		}
  		return { user: session?.user ?? null };
  	},
  	component: RouteComponent,
  });

  function RouteComponent() {
  	const { user } = Route.useRouteContext();
  	return (
  		<SidebarProvider className="h-svh">
  			<AppSidebar user={user} />
  			<Outlet />
  		</SidebarProvider>
  	);
  }
  ```

- [ ] **Commit**

  ```bash
  git add apps/web/src/routes/_memos.tsx
  git commit -m "refactor: remove SearchPanel from global layout"
  ```

---

### Task 2: Update pages that need SearchPanel

These pages need `<SearchPanel />` + `<SidebarInset>` wrapped around their content.

**Files:**
- Modify: `apps/web/src/routes/_memos/explore.tsx`
- Modify: `apps/web/src/routes/_memos/_protected/home.tsx`
- Modify: `apps/web/src/routes/_memos/_protected/archived.tsx`
- Modify: `apps/web/src/routes/_memos/u/$username.tsx`

- [ ] **Update explore.tsx**

  Add imports and wrap content:
  ```tsx
  import { SidebarInset } from "@memos/ui/components/sidebar";
  import { SearchPanel } from "@/components/search-panel/search-panel";
  ```

  Change the return:
  ```tsx
  function RouteComponent() {
  	const { filter, userId } = Route.useLoaderData();
  	const { data: memos } = useSuspenseQuery(
  		listExploreMemosQueryOptions(filter),
  	);

  	return (
  		<>
  			<SearchPanel />
  			<SidebarInset className="overflow-y-auto">
  				<div className="mx-auto w-full max-w-2xl px-4 pt-8">
  					<MemoList memos={memos} userId={userId} />
  				</div>
  			</SidebarInset>
  		</>
  	);
  }
  ```

- [ ] **Update home.tsx**

  Add imports:
  ```tsx
  import { SidebarInset } from "@memos/ui/components/sidebar";
  import { SearchPanel } from "@/components/search-panel/search-panel";
  ```

  Change the return:
  ```tsx
  function RouteComponent() {
  	const [resetKey, setResetKey] = useState(0);
  	const queryClient = useQueryClient();
  	const { filter, userId } = Route.useLoaderData();
  	const { data: memos } = useSuspenseQuery(memosQueryOptions(filter));

  	const mutation = useMutation({
  		mutationFn: createMemoFn,
  		onSuccess: () => {
  			toast.success("已保存");
  			queryClient.invalidateQueries({ queryKey: ["memos"] });
  			queryClient.invalidateQueries({ queryKey: ["memos-stats"] });
  			setResetKey((k) => k + 1);
  		},
  		onError: (error) => {
  			toast.error(error instanceof Error ? error.message : "保存失败");
  		},
  	});

  	return (
  		<>
  			<SearchPanel />
  			<SidebarInset className="overflow-y-auto">
  				<div className="mx-auto w-full max-w-2xl px-4 pt-8">
  					<Editor
  						key={resetKey}
  						isSaving={mutation.isPending}
  						onSave={(data) => mutation.mutate({ data })}
  					/>
  					<MemoList memos={memos} userId={userId} />
  				</div>
  			</SidebarInset>
  		</>
  	);
  }
  ```

- [ ] **Update archived.tsx**

  Replace with a proper page layout (still placeholder content):
  ```tsx
  import { SidebarInset } from "@memos/ui/components/sidebar";
  import { createFileRoute } from "@tanstack/react-router";
  import { SearchPanel } from "@/components/search-panel/search-panel";

  export const Route = createFileRoute("/_memos/_protected/archived")({
  	component: RouteComponent,
  });

  function RouteComponent() {
  	return (
  		<>
  			<SearchPanel />
  			<SidebarInset className="overflow-y-auto">
  				<div className="mx-auto w-full max-w-2xl px-4 pt-8">
  					<div>Hello "/_memos/_protected/archived"!</div>
  				</div>
  			</SidebarInset>
  		</>
  	);
  }
  ```

- [ ] **Update u/$username.tsx**

  Replace with a proper page layout (still placeholder content):
  ```tsx
  import { SidebarInset } from "@memos/ui/components/sidebar";
  import { createFileRoute } from "@tanstack/react-router";
  import { SearchPanel } from "@/components/search-panel/search-panel";

  export const Route = createFileRoute("/_memos/u/$username")({
  	component: RouteComponent,
  });

  function RouteComponent() {
  	return (
  		<>
  			<SearchPanel />
  			<SidebarInset className="overflow-y-auto">
  				<div className="mx-auto w-full max-w-2xl px-4 pt-8">
  					<div>Hello "/_memos/u/$username"!</div>
  				</div>
  			</SidebarInset>
  		</>
  	);
  }
  ```

- [ ] **Commit**

  ```bash
  git add \
    apps/web/src/routes/_memos/explore.tsx \
    apps/web/src/routes/_memos/_protected/home.tsx \
    apps/web/src/routes/_memos/_protected/archived.tsx \
    apps/web/src/routes/_memos/u/\$username.tsx
  git commit -m "refactor: wrap pages with SearchPanel and SidebarInset"
  ```

---

### Task 3: Update pages without SearchPanel

These pages only need `<SidebarInset>` wrapper (no SearchPanel).

**Files:**
- Modify: `apps/web/src/routes/_memos/_protected/inbox.tsx`
- Modify: `apps/web/src/routes/_memos/_protected/attachments.tsx`
- Modify: `apps/web/src/routes/_memos/about.tsx`

- [ ] **Update inbox.tsx**

  ```tsx
  import { SidebarInset } from "@memos/ui/components/sidebar";
  import { createFileRoute } from "@tanstack/react-router";

  export const Route = createFileRoute("/_memos/_protected/inbox")({
  	component: RouteComponent,
  });

  function RouteComponent() {
  	return (
  		<SidebarInset className="overflow-y-auto">
  			<div className="mx-auto w-full max-w-2xl px-4 pt-8">
  				<div>Hello "/_memos/_protected/inbox"!</div>
  			</div>
  		</SidebarInset>
  	);
  }
  ```

- [ ] **Update attachments.tsx**

  ```tsx
  import { SidebarInset } from "@memos/ui/components/sidebar";
  import { createFileRoute } from "@tanstack/react-router";

  export const Route = createFileRoute("/_memos/_protected/attachments")({
  	component: RouteComponent,
  });

  function RouteComponent() {
  	return (
  		<SidebarInset className="overflow-y-auto">
  			<div className="mx-auto w-full max-w-2xl px-4 pt-8">
  				<div>Hello "/_memos/_protected/attachments"!</div>
  			</div>
  		</SidebarInset>
  	);
  }
  ```

- [ ] **Update about.tsx**

  ```tsx
  import { SidebarInset } from "@memos/ui/components/sidebar";
  import { createFileRoute } from "@tanstack/react-router";

  export const Route = createFileRoute("/_memos/about")({
  	component: RouteComponent,
  });

  function RouteComponent() {
  	return (
  		<SidebarInset className="overflow-y-auto">
  			<div className="mx-auto w-full max-w-2xl px-4 pt-8">
  				<div>Hello "/_memos/about"!</div>
  			</div>
  		</SidebarInset>
  	);
  }
  ```

- [ ] **Commit**

  ```bash
  git add \
    apps/web/src/routes/_memos/_protected/inbox.tsx \
    apps/web/src/routes/_memos/_protected/attachments.tsx \
    apps/web/src/routes/_memos/about.tsx
  git commit -m "refactor: wrap pages without SearchPanel in SidebarInset"
  ```

---

### Task 4: Add i18n messages for settings

**Files:**
- Modify: `apps/web/messages/en.json`
- Modify: `apps/web/messages/zh-Hans.json`

- [ ] **Add English messages**

  Append to `messages/en.json`:
  ```json
  "settings_my_account": "My Account",
  "settings_preferences": "Preferences",
  "settings_avatar": "Avatar",
  "settings_change_avatar": "Change Avatar",
  "settings_change_password": "Change Password",
  "settings_current_password": "Current Password",
  "settings_new_password": "New Password",
  "settings_confirm_new_password": "Confirm New Password",
  "settings_password_changed": "Password changed successfully",
  "settings_delete_account": "Delete Account",
  "settings_delete_account_confirm_title": "Delete Account",
  "settings_delete_account_confirm_description": "Are you sure you want to delete your account? This action cannot be undone.",
  "settings_delete_account_confirm": "Delete",
  "settings_cancel": "Cancel",
  "settings_appearance": "Appearance",
  "settings_language": "Language",
  "settings_theme": "Theme",
  "settings_memo_defaults": "Memo Defaults",
  "settings_default_visibility": "Default Visibility",
  "settings_private": "Private",
  "settings_workspace": "Workspace",
  "settings_public": "Public"
  ```

- [ ] **Add Chinese messages**

  Append to `messages/zh-Hans.json`:
  ```json
  "settings_my_account": "我的账户",
  "settings_preferences": "偏好设置",
  "settings_avatar": "头像",
  "settings_change_avatar": "更换头像",
  "settings_change_password": "修改密码",
  "settings_current_password": "当前密码",
  "settings_new_password": "新密码",
  "settings_confirm_new_password": "确认新密码",
  "settings_password_changed": "密码修改成功",
  "settings_delete_account": "删除账号",
  "settings_delete_account_confirm_title": "删除账号",
  "settings_delete_account_confirm_description": "确定要删除账号吗？此操作不可撤销。",
  "settings_delete_account_confirm": "删除",
  "settings_cancel": "取消",
  "settings_appearance": "外观",
  "settings_language": "语言",
  "settings_theme": "主题",
  "settings_memo_defaults": "备忘录默认",
  "settings_default_visibility": "默认可见性",
  "settings_private": "私有",
  "settings_workspace": "工作区",
  "settings_public": "公开"
  ```

- [ ] **Regenerate paraglide messages**

  Run:
  ```bash
  cd apps/web && bun run @inlang/paraglide-js compile
  ```

- [ ] **Commit**

  ```bash
  git add apps/web/messages/en.json apps/web/messages/zh-Hans.json
  git commit -m "feat: add settings page i18n messages"
  ```

---

### Task 5: Build the settings page

**Files:**
- Replace: `apps/web/src/routes/_memos/_protected/settings.tsx`
- Create: `apps/web/src/features/settings/components/settings-view.tsx`

#### Route file: `apps/web/src/routes/_memos/_protected/settings.tsx`

```tsx
import { SidebarInset } from "@memos/ui/components/sidebar";
import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/features/settings/components/settings-view";

export const Route = createFileRoute("/_memos/_protected/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SidebarInset className="overflow-y-auto">
			<div className="mx-auto w-full max-w-3xl px-4 pt-8">
				<SettingsView />
			</div>
		</SidebarInset>
	);
}
```

#### Settings component: `apps/web/src/features/settings/components/settings-view.tsx`

Full code:

```tsx
import { Button } from "@memos/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@memos/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@memos/ui/components/dialog";
import { Field, FieldLabel } from "@memos/ui/components/field";
import { Input } from "@memos/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@memos/ui/components/select";
import { Separator } from "@memos/ui/components/separator";
import { useQueryClient } from "@tanstack/react-query";
import {
	CameraIcon,
	GlobeIcon,
	LockIcon,
	Trash2Icon,
	UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme-provider";
import { m } from "@/paraglide/messages";
import { getLocale, locales } from "@/paraglide/runtime";
import { loadLocale } from "@/utils/i18n";

const visibilityOptions = [
	{ value: "private", label: m.settings_private(), icon: LockIcon },
	{ value: "workspace", label: m.settings_workspace(), icon: UsersIcon },
	{ value: "public", label: m.settings_public(), icon: GlobeIcon },
] as const;

export function SettingsView() {
	const [activeTab, setActiveTab] = useState<"account" | "preferences">("account");

	const tabs = [
		{ id: "account" as const, label: m.settings_my_account() },
		{ id: "preferences" as const, label: m.settings_preferences() },
	];

	return (
		<Card className="flex-row! gap-0! p-0!">
			<div className="flex w-48 shrink-0 flex-col border-r p-1">
				{tabs.map((tab) => (
					<Button
						key={tab.id}
						variant={activeTab === tab.id ? "secondary" : "ghost"}
						className="justify-start rounded-lg px-3 py-2"
						onClick={() => setActiveTab(tab.id)}
					>
						{tab.label}
					</Button>
				))}
			</div>
			<div className="flex-1 p-6">
				{activeTab === "account" ? <MyAccountSection /> : <PreferencesSection />}
			</div>
		</Card>
	);
}

function MyAccountSection() {
	const queryClient = useQueryClient();
	const session = authClient.useSession();
	const user = session.data?.user;

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await fetch("/api/files/upload", { method: "POST", body: formData });
			const { path } = await res.json();
			await authClient.updateUser({ image: path });
			queryClient.invalidateQueries({ queryKey: ["session"] });
			toast.success("头像已更新");
		} catch {
			toast.error("头像更新失败");
		}
	};

	return (
		<div className="space-y-8">
			<div>
				<h3 className="mb-4 font-medium text-base">{m.settings_avatar()}</h3>
				<div className="relative inline-block">
					<div className="size-20 overflow-hidden rounded-full ring-2 ring-foreground/10">
						<img
							src={user?.image ?? "/default-avatar.png"}
							alt="avatar"
							className="size-full object-cover"
						/>
					</div>
					<label
						htmlFor="avatar-upload"
						className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100"
					>
						<CameraIcon className="size-6 text-white" />
					</label>
					<input
						id="avatar-upload"
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleAvatarChange}
					/>
				</div>
			</div>

			<Separator />

			<div>
				<h3 className="mb-4 font-medium text-base">{m.settings_change_password()}</h3>
				<ChangePasswordForm />
			</div>

			<Separator />

			<div>
				<h3 className="mb-4 font-medium text-base text-destructive">
					{m.settings_delete_account()}
				</h3>
				<DeleteAccountDialog />
			</div>
		</div>
	);
}

function ChangePasswordForm() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error("密码不匹配");
			return;
		}
		setIsSubmitting(true);
		try {
			await authClient.changePassword({ currentPassword, newPassword });
			toast.success(m.settings_password_changed());
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "修改失败");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="max-w-sm space-y-3">
			<Field>
				<FieldLabel>{m.settings_current_password()}</FieldLabel>
				<Input
					type="password"
					value={currentPassword}
					onChange={(e) => setCurrentPassword(e.target.value)}
					required
				/>
			</Field>
			<Field>
				<FieldLabel>{m.settings_new_password()}</FieldLabel>
				<Input
					type="password"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					required
				/>
			</Field>
			<Field>
				<FieldLabel>{m.settings_confirm_new_password()}</FieldLabel>
				<Input
					type="password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
				/>
			</Field>
			<Button type="submit" disabled={isSubmitting} className="mt-2">
				{m.settings_change_password()}
			</Button>
		</form>
	);
}

function DeleteAccountDialog() {
	const queryClient = useQueryClient();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			// Delete account via better-auth API
			await authClient.deleteUser?.();
			queryClient.invalidateQueries({ queryKey: ["session"] });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "删除失败");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog>
			<DialogTrigger render={<Button variant="destructive"><Trash2Icon className="size-4" />{m.settings_delete_account()}</Button>} />
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{m.settings_delete_account_confirm_title()}</DialogTitle>
					<DialogDescription>
						{m.settings_delete_account_confirm_description()}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
						{m.settings_delete_account_confirm()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function PreferencesSection() {
	return (
		<div className="space-y-8">
			<div>
				<h3 className="mb-4 font-medium text-base">{m.settings_appearance()}</h3>
				<div className="max-w-xs space-y-4">
					<LanguageSelect />
					<ThemeSelect />
				</div>
			</div>

			<Separator />

			<div>
				<h3 className="mb-4 font-medium text-base">{m.settings_memo_defaults()}</h3>
				<div className="max-w-xs">
					<DefaultVisibilitySelect />
				</div>
			</div>
		</div>
	);
}

function LanguageSelect() {
	const currentLocale = getLocale();

	return (
		<Field>
			<FieldLabel>{m.settings_language()}</FieldLabel>
			<Select
				value={currentLocale}
				onValueChange={(value) => {
					loadLocale(value);
				}}
			>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{locales.map((locale) => (
						<SelectItem key={locale} value={locale}>
							{locale === "zh-Hans" ? "简体中文" : "English"}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</Field>
	);
}

function ThemeSelect() {
	const { userTheme, setTheme } = useTheme();
	const themeOptions = [
		{ value: "light", label: m.sidebar_light() },
		{ value: "dark", label: m.sidebar_dark() },
		{ value: "paper", label: m.sidebar_paper() },
		{ value: "system", label: m.sidebar_system() },
	];

	return (
		<Field>
			<FieldLabel>{m.settings_theme()}</FieldLabel>
			<Select
				value={userTheme}
				onValueChange={(value) => setTheme(value as typeof userTheme)}
			>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{themeOptions.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</Field>
	);
}

function DefaultVisibilitySelect() {
	return (
		<Field>
			<FieldLabel>{m.settings_default_visibility()}</FieldLabel>
			<Select defaultValue="private">
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{visibilityOptions.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</Field>
	);
}
```

- [ ] **Create the settings-view.tsx file**

  Create `apps/web/src/features/settings/components/settings-view.tsx` with the content above.

- [ ] **Replace the settings route file**

  Replace `apps/web/src/routes/_memos/_protected/settings.tsx` with the route file content above.

- [ ] **Verify the build compiles**

  ```bash
  cd apps/web && bunx tsc --noEmit
  ```

- [ ] **Commit**

  ```bash
  git add \
    apps/web/src/routes/_memos/_protected/settings.tsx \
    apps/web/src/features/settings/components/settings-view.tsx
  git commit -m "feat: add settings page with account and preferences tabs"
  ```
