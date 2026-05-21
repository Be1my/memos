import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@memos/ui/components/select";
import { Globe } from "lucide-react";
import { localeLabels } from "@/lib/locale-config";
import type { Locale } from "@/lib/locale";
import { getLocale, locales } from "@/paraglide/runtime";
import { loadLocale } from "@/utils/i18n";

export default function LocaleSelector() {
	const currentLocale = getLocale();

	const handleSelectChange = (locale: string | null) => {
		if (!locale || !locales.includes(locale as Locale)) return;
		loadLocale(locale);
	};

	return (
		<Select value={currentLocale} onValueChange={handleSelectChange}>
			<SelectTrigger>
				<div className="flex items-center gap-2">
					<Globe className="h-auto w-4" />
					<SelectValue placeholder="Select language">
						{localeLabels[currentLocale]}
					</SelectValue>
				</div>
			</SelectTrigger>
			<SelectContent>
				{locales.map((locale) => (
					<SelectItem key={locale} value={locale}>
						{localeLabels[locale]}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
