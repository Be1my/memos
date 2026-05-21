import { Monitor, Moon, Palette, Sun, type LucideIcon } from "lucide-react";
import { m } from "@/paraglide/messages";
import type { UserTheme } from "@/lib/theme-provider";

export type { UserTheme };

const themeMeta: Record<
	UserTheme,
	{ icon: LucideIcon; labelKey: keyof typeof m }
> = {
	light: { icon: Sun, labelKey: "sidebar_light" },
	dark: { icon: Moon, labelKey: "sidebar_dark" },
	paper: { icon: Palette, labelKey: "sidebar_paper" },
	system: { icon: Monitor, labelKey: "sidebar_system" },
};

export function getThemeConfig(): Record<
	UserTheme,
	{ icon: React.ReactNode; label: string }
> {
	const entries = Object.entries(themeMeta) as [UserTheme, (typeof themeMeta)[UserTheme]][];
	return Object.fromEntries(
		entries.map(([key, meta]) => [
			key,
			{
				icon: <meta.icon className="h-auto w-4" />,
				label: (m[meta.labelKey] as () => string)(),
			},
		]),
	) as Record<UserTheme, { icon: React.ReactNode; label: string }>;
}
