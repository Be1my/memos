import type { Locale } from "@/lib/locale";
import { locales, setLocale } from "@/paraglide/runtime";

const LOCALE_STORAGE_KEY = "memos-locale";

const getStoredLocale = (): string | null => {
	try {
		const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
		return stored && locales.includes(stored as Locale) ? stored : null;
	} catch {
		return null;
	}
};

const setStoredLocale = (locale: string): void => {
	try {
		localStorage.setItem(LOCALE_STORAGE_KEY, locale);
	} catch {}
};

export const findNearestMatchedLanguage = (language: string): string => {
	if (locales.includes(language as Locale)) return language;
	const shortCode = language.substring(0, 2);
	const match = locales.find((l) => l.substring(0, 2) === shortCode);
	return match ?? "en";
};

export const isValidLocale = (locale: string | undefined | null): boolean => {
	if (!locale) return false;
	return locales.includes(locale as Locale);
};

export const getLocaleWithFallback = (userLocale?: string): string => {
	if (userLocale && isValidLocale(userLocale)) return userLocale;
	const stored = getStoredLocale();
	if (stored) return stored;
	return findNearestMatchedLanguage(
		typeof navigator !== "undefined" ? navigator.language : "en",
	);
};

export const loadLocale = (locale: string): string => {
	const validLocale = isValidLocale(locale)
		? locale
		: findNearestMatchedLanguage(
				typeof navigator !== "undefined" ? navigator.language : "en",
			);
	setStoredLocale(validLocale);
	setLocale(validLocale as Locale, { reload: true });
	document.documentElement.lang = validLocale;
	return validLocale;
};
