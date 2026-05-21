import { Button } from "@memos/ui/components/button";
import { Card } from "@memos/ui/components/card";
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
import {
	CameraIcon,
	GlobeIcon,
	LockIcon,
	Trash2Icon,
	UsersIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getUploadPresignedUrlsFn } from "@/lib/get-upload-urls.function";
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
	const [activeTab, setActiveTab] = useState<"account" | "preferences">(
		"account",
	);

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
				{activeTab === "account" ? (
					<MyAccountSection />
				) : (
					<PreferencesSection />
				)}
			</div>
		</Card>
	);
}

function MyAccountSection() {
	const session = authClient.useSession();
	const user = session.data?.user;
	const avatarInputRef = useRef<HTMLInputElement>(null);

	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || isUploadingAvatar) return;

		setIsUploadingAvatar(true);
		try {
			const { urls } = await getUploadPresignedUrlsFn({
				data: {
					files: [{ name: file.name, type: file.type, size: file.size }],
				},
			});

			const entry = urls[0];
			const res = await fetch(entry.url, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type },
			});
			if (!res.ok) throw new Error("Upload failed");

			await authClient.updateUser({
				image: `/api/files?key=${encodeURIComponent(entry.key)}`,
			});
			toast.success(m.settings_avatar_updated());
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : m.settings_avatar_failed(),
			);
		} finally {
			setIsUploadingAvatar(false);
			if (avatarInputRef.current) {
				avatarInputRef.current.value = "";
			}
		}
	};

	return (
		<div className="space-y-8">
			<div>
				<h3 className="mb-4 font-medium text-base">{m.settings_avatar()}</h3>
				<div className="relative inline-block">
					<div className="size-20 overflow-hidden rounded-full ring-2 ring-foreground/10">
						<img
							src={user?.image ?? "/logo.webp"}
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
						ref={avatarInputRef}
						type="file"
						accept="image/*"
						className="hidden"
						disabled={isUploadingAvatar}
						onChange={handleAvatarChange}
					/>
				</div>
			</div>

			<Separator />

			<div>
				<h3 className="mb-4 font-medium text-base">
					{m.settings_change_password()}
				</h3>
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
			toast.error(m.settings_password_mismatch());
			return;
		}
		if (newPassword === currentPassword) {
			toast.error(m.settings_password_same());
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
			toast.error(
				err instanceof Error ? err.message : m.settings_password_failed(),
			);
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
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await authClient.deleteUser?.();
			toast.success(m.settings_account_deleted());
			setOpen(false);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : m.settings_delete_failed(),
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button variant="destructive">
						<Trash2Icon className="size-4" />
						{m.settings_delete_account()}
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{m.settings_delete_account_confirm_title()}</DialogTitle>
					<DialogDescription>
						{m.settings_delete_account_confirm_description()}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						{m.settings_cancel()}
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isDeleting}
					>
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
				<h3 className="mb-4 font-medium text-base">
					{m.settings_appearance()}
				</h3>
				<div className="max-w-xs space-y-4">
					<LanguageSelect />
					<ThemeSelect />
				</div>
			</div>

			<Separator />

			<div>
				<h3 className="mb-4 font-medium text-base">
					{m.settings_memo_defaults()}
				</h3>
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
					if (!value) return;
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
	const [defaultVisibility, setDefaultVisibility] = useState(() => {
		try {
			return localStorage.getItem("default-visibility") || "private";
		} catch {
			return "private";
		}
	});

	const handleChange = (value: string | null) => {
		if (!value) return;
		setDefaultVisibility(value);
		try {
			localStorage.setItem("default-visibility", value);
		} catch {}
	};

	return (
		<Field>
			<FieldLabel>{m.settings_default_visibility()}</FieldLabel>
			<Select value={defaultVisibility} onValueChange={handleChange}>
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
