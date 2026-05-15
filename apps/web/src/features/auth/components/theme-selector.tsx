import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@memos/ui/components/select";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { type UserTheme, useTheme } from "@/lib/theme-provider";

const themeConfig: Record<UserTheme, { icon: React.ReactNode; label: string }> =
	{
		light: { icon: <Sun className="h-auto w-4" />, label: "Light" },
		dark: { icon: <Moon className="h-auto w-4" />, label: "Dark" },
		paper: { icon: <Palette className="h-auto w-4" />, label: "Paper" },
		system: { icon: <Monitor className="h-auto w-4" />, label: "System" },
	};

const themeOptions = Object.keys(themeConfig) as UserTheme[];

const themeCssClass: Record<UserTheme, string> = {
	light: "[html.light:not(.system)_&]:flex",
	dark: "[html.dark:not(.system)_&]:flex",
	paper: "[html.paper_&]:flex",
	system: "[html.system_&]:flex",
};

export default function ThemeSelector() {
	const { userTheme, setTheme } = useTheme();

	return (
		<Select
			value={userTheme}
			onValueChange={(t) => t && setTheme(t as UserTheme)}
		>
			<SelectTrigger>
				{themeOptions.map((theme) => (
					<span
						key={theme}
						className={`${themeCssClass[theme]} hidden items-center gap-2`}
					>
						{themeConfig[theme].icon}
						{themeConfig[theme].label}
					</span>
				))}
				<SelectValue placeholder="Select theme" className="sr-only" />
			</SelectTrigger>
			<SelectContent>
				{themeOptions.map((theme) => (
					<SelectItem key={theme} value={theme}>
						{themeConfig[theme].icon}
						{themeConfig[theme].label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
