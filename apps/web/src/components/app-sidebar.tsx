import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
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
import { Link } from "@tanstack/react-router";
import {
	ArchiveIcon,
	CompassIcon,
	FileTextIcon,
	InboxIcon,
	InfoIcon,
	LogInIcon,
	LogOutIcon,
	type LucideIcon,
	PaperclipIcon,
	SettingsIcon,
	StickyNoteIcon,
	UserIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { FileRouteTypes } from "@/routeTree.gen";

const LogoIcon = StickyNoteIcon;
function SidebarLogo() {
	return (
		<SidebarMenuButton tooltip="Memos" size="sm" className="h-9!">
			<LogoIcon className="size-5!" />
			<span className="font-semibold group-data-collapsible=icon:group-data-state=collapsed:hidden">
				Memos
			</span>
		</SidebarMenuButton>
	);
}
interface AppSidebarProps {
	ssrSession?: {
		user: {
			id: string;
			name: string;
			email: string;
			image?: string | null;
		};
		session: {
			id: string;
		};
	} | null;
}

export function AppSidebar({ ssrSession }: AppSidebarProps) {
	const { data } = authClient.useSession();
	const session = data ?? ssrSession;
	const user = session?.user;

	const navItems = session ? authedNav : guestNav;

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
							<UserDropdown />
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

const guestNav: NavItem[] = [
	{ icon: CompassIcon, label: "Explore", to: "/explore" },
	{ icon: InfoIcon, label: "About", to: "/about" },
	{ icon: LogInIcon, label: "Sign in", to: "/sign-in" },
];

const authedNav: NavItem[] = [
	{ icon: FileTextIcon, label: "Memos", to: "/home" },
	{ icon: CompassIcon, label: "Explore", to: "/explore" },
	{ icon: PaperclipIcon, label: "Attachments", to: "/attachments" },
	{ icon: InboxIcon, label: "Inbox", to: "/inbox" },
];
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
function UserDropdown() {
	const session = authClient.useSession();
	if (!session.data) {
		return null;
	}
	const user = session.data.user;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<SidebarMenuButton tooltip={user?.name ?? "User"} />}
			>
				<UserIcon />
				<span className="group-data-collapsible=icon:group-data-state=collapsed:hidden">
					{user?.name ?? "User"}
				</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				side="right"
				sideOffset={8}
				className="w-48"
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						render={
							<Link to="/u/$username" params={{ username: user.name }}>
								<UserIcon />
								Profile
							</Link>
						}
					/>
					<DropdownMenuItem
						render={
							<Link to="/archived">
								<ArchiveIcon />
								Archived
							</Link>
						}
					/>
					<DropdownMenuItem
						render={
							<Link to="/about">
								<InfoIcon />
								About
							</Link>
						}
					/>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				{/* <LanguageSubmenu />
                <ThemeSubmenu /> */}
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						render={
							<Link to="/settings">
								<SettingsIcon />
								Settings
							</Link>
						}
					/>
					<DropdownMenuItem
						variant="destructive"
						onClick={() => {
							// authClient.signOut({
							// 	fetchOptions: {
							// 		onSuccess: () => {
							// 			queryClient.invalidateQueries({
							// 				queryKey: sessionQuery.queryKey,
							// 			});
							// 			navigate({ to: "/" });
							// 		},
							// 	},
							// });
						}}
					>
						<LogOutIcon />
						Sign Out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
