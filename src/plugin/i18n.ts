import fs from "node:fs";
import path from "node:path";

import { type Language } from "../api";
import { parseLocalizations } from "../common/i18n";
import { type JsonObject } from "../common/json";
import { logger } from "./logging";

/**
 * Loads a locale from the file system.
 * @param language Language to load.
 * @returns Contents of the locale.
 */
export function fileSystemLocaleProvider(language: Language): JsonObject | null {
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
