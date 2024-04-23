import type { Language } from "../api";
import { I18nProvider, parseLocalizations } from "../common/i18n";
import type { JsonObject } from "../common/json";
import { logger } from "./logging";

const __cwd = cwd();

/**
 * Internalization provider, responsible for managing localizations and translating resources.
 */
export const i18n = new I18nProvider((window.navigator.language ? window.navigator.language.split("-")[0] : "en") as Language, xmlHttpRequestLocaleProviderSync);

/**
 * Loads a locale from the file system using `fetch`.
 * @param language Language to load.
 * @returns Contents of the locale.
 */
export function xmlHttpRequestLocaleProviderSync(language: Language): JsonObject | null {
	const filePath = `${__cwd}${language}.json`;

	try {
		const req = new XMLHttpRequest();
		req.open("GET", filePath, false);
		req.send();

		return parseLocalizations(req.response);
	} catch (err) {
		if (err instanceof DOMException && err.name === "NOT_FOUND_ERR") {
			// Browser consoles will inherently log an error if a resource cannot be found; we should provide
			// a more forgiving warning alongside the error, without cluttering the main log file.
			console.warn(`Missing localization file: ${language}.json`);
		} else {
			logger.error(`Failed to load translations from ${filePath}`, err);
		}

		return null;
	}
}

/**
 * Gets the current working directory.
 * @returns The directory.
 */
export function cwd(): string {
	let path = "";

	const segments = window.location.href.split("/");
	for (let i = 0; i < segments.length - 1; i++) {
		path += `${segments[i]}/`;
		if (segments[i].endsWith(".sdPlugin")) {
			break;
		}
	}

	return path;
}
