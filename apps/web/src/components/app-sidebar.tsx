import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@memos/ui/components/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
} from "@memos/ui/components/sidebar";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	ArchiveIcon,
	CheckIcon,
	CompassIcon,
	FileTextIcon,
	GlobeIcon,
	InboxIcon,
	InfoIcon,
	LogInIcon,
	LogOutIcon,
	type LucideIcon,
	PaletteIcon,
	PaperclipIcon,
	SettingsIcon,
	UserIcon,
} from "lucide-react";
import { localeLabels } from "@/lib/locale-config";
import { getThemeConfig } from "@/lib/theme-config";
import { useTheme } from "@/lib/theme-provider";
import { authClient } from "@/lib/auth-client";
import { m } from "@/paraglide/messages";
import { getLocale, locales } from "@/paraglide/runtime";
import type { FileRouteTypes } from "@/routeTree.gen";
import { loadLocale } from "@/utils/i18n";

function SidebarLogo() {
	return (
		<SidebarMenuButton tooltip="Memos" size="sm" className="h-auto! p-1!">
			<img src="/logo.webp" alt="Memos" className="h-auto w-full" />
		</SidebarMenuButton>
	);
}
interface AppSidebarProps {
	user?: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	} | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
	const navItems = user ? getAuthedNav() : getGuestNav();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarLogo />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<NavItems items={navItems} />
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarSeparator />
				<SidebarMenu>
					{user && (
						<SidebarMenuItem>
							<UserDropdown user={user} />
						</SidebarMenuItem>
					)}
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

type AppRoutePath = FileRouteTypes["fullPaths"];

type NavItem = {
	icon: LucideIcon;
	label: string;
	to: AppRoutePath;
};

function getGuestNav(): NavItem[] {
	return [
		{ icon: CompassIcon, label: m.sidebar_explore(), to: "/explore" },
		{ icon: InfoIcon, label: m.sidebar_about(), to: "/about" },
		{ icon: LogInIcon, label: m.sidebar_sign_in(), to: "/sign-in" },
	];
}

function getAuthedNav(): NavItem[] {
	return [
		{ icon: FileTextIcon, label: m.sidebar_memos(), to: "/home" },
		{ icon: CompassIcon, label: m.sidebar_explore(), to: "/explore" },
		{ icon: PaperclipIcon, label: m.sidebar_attachments(), to: "/attachments" },
		{ icon: InboxIcon, label: m.sidebar_inbox(), to: "/inbox" },
	];
}
function NavItems({ items }: { items: NavItem[] }) {
	return items.map((item) => (
		<SidebarMenuItem key={item.to}>
			<SidebarMenuButton
				tooltip={item.label}
				render={
					<Link to={item.to}>
						<item.icon />
						<span>{item.label}</span>
					</Link>
				}
			/>
		</SidebarMenuItem>
	));
}

function ThemeSubmenu() {
	const { userTheme, setTheme } = useTheme();
	const themeOptions = ["light", "dark", "paper", "system"] as const;
	const themeConfig = getThemeConfig();
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<PaletteIcon />
				{m.sidebar_theme()}
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				{themeOptions.map((theme) => (
					<DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>
						{themeConfig[theme].icon}
						<span className="flex-1">{themeConfig[theme].label}</span>
						{userTheme === theme && <CheckIcon className="size-4" />}
					</DropdownMenuItem>
				))}
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}

function LanguageSubmenu() {
	const currentLocale = getLocale();
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<GlobeIcon />
				{m.sidebar_language()}
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				{locales.map((locale) => (
					<DropdownMenuItem key={locale} onClick={() => loadLocale(locale)}>
						<span className="flex-1">
							{localeLabels[locale] ?? locale}
						</span>
						{currentLocale === locale && <CheckIcon className="size-4" />}
					</DropdownMenuItem>
				))}
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}
function UserDropdown({
	user,
}: {
	user: { id: string; name: string; email: string; image?: string | null };
}) {
	const navigate = useNavigate();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<SidebarMenuButton />}>
				<UserIcon />
				<span className="group-data-collapsible=icon:group-data-state=collapsed:hidden">
					{user?.name ?? "User"}
				</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				side="top"
				sideOffset={8}
				className="w-48"
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel>{m.sidebar_my_account()}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						render={
							<Link to="/u/$username" params={{ username: user.name }}>
								<UserIcon />
								{m.sidebar_profile()}
							</Link>
						}
					/>
					<DropdownMenuItem
						render={
							<Link to="/archived">
								<ArchiveIcon />
								{m.sidebar_archived()}
							</Link>
						}
					/>
					<DropdownMenuItem
						render={
							<Link to="/about">
								<InfoIcon />
								{m.sidebar_about()}
							</Link>
						}
					/>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<LanguageSubmenu />
				<ThemeSubmenu />
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						render={
							<Link to="/settings">
								<SettingsIcon />
								{m.sidebar_settings()}
							</Link>
						}
					/>
					<DropdownMenuItem
						variant="destructive"
						onClick={() => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										navigate({ to: "/sign-in" });
									},
								},
							});
						}}
					>
						<LogOutIcon />
						{m.sidebar_sign_out()}
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
