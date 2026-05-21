import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@memos/ui/components/select";
import { getThemeConfig } from "@/lib/theme-config";
import { type UserTheme, useTheme } from "@/lib/theme-provider";

const themeOptions = ["light", "dark", "paper", "system"] as UserTheme[];

const themeCssClass: Record<UserTheme, string> = {
	light: "[html.light:not(.system)_&]:flex",
	dark: "[html.dark:not(.system)_&]:flex",
	paper: "[html.paper_&]:flex",
	system: "[html.system_&]:flex",
};

export default function ThemeSelector() {
	const { userTheme, setTheme } = useTheme();
	const themeConfig = getThemeConfig();

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
