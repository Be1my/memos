import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@memos/ui/components/select";
import { Globe } from "lucide-react";
import type { Locale } from "@/features/i18n/schemas";
import { getLocale, locales } from "@/paraglide/runtime";
import { loadLocale } from "@/utils/i18n";

const localeConfig: Record<Locale, { label: string }> = {
	"zh-Hans": { label: "简体中文" },
	en: { label: "English" },
};

export default function LocaleSelector() {
	const currentLocale = getLocale();

	const handleSelectChange = (locale: string | null) => {
		if (!locale || !locales.includes(locale as any)) return;
		loadLocale(locale);
	};

	return (
		<Select value={currentLocale} onValueChange={handleSelectChange}>
			<SelectTrigger>
				<div className="flex items-center gap-2">
					<Globe className="h-auto w-4" />
					<SelectValue placeholder="Select language">
						{localeConfig[currentLocale].label}
					</SelectValue>
				</div>
			</SelectTrigger>
			<SelectContent>
				{locales.map((locale) => (
					<SelectItem key={locale} value={locale}>
						{localeConfig[locale].label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
