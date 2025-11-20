import type { JsonObject } from "@elgato/utils";
import type { Language } from "@elgato/utils/i18n";
import fs from "node:fs";
import path from "node:path";

import type { Language as SupportedLanguage } from "../api/i18n.js";
import { logger } from "./logging/index.js";

/**
 * Loads a locale from the file system.
 * @param language Language to load.
 * @returns Contents of the locale.
 */
export function fileSystemLocaleProvider(language: Language<SupportedLanguage>): JsonObject | null {
	const filePath = path.join(process.cwd(), `${language}.json`);
	if (!fs.existsSync(filePath)) {
		return null;
	}

	try {
		// Parse the translations from the file.
		const contents = fs.readFileSync(filePath, { flag: "r" })?.toString();
		return parseLocalizations(contents);
	} catch (err) {
		logger.error(`Failed to load translations from ${filePath}`, err);
		return null;
	}
}

/**
 * Parses the localizations from the specified contents, or throws a `TypeError` when unsuccessful.
 * @param contents Contents that represent the stringified JSON containing the localizations.
 * @returns The localizations; otherwise a `TypeError`.
 */
function parseLocalizations(contents: string): JsonObject {
	const json = JSON.parse(contents);
	if (json !== undefined && json !== null && typeof json === "object" && "Localization" in json) {
		return json["Localization"] as JsonObject;
	}

	throw new TypeError(`Translations must be a JSON object nested under a property named "Localization"`);
}
