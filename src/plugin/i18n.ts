import fs from "node:fs";
import path from "node:path";

import { type Language } from "../api";
import { type JsonObject } from "../common/json";
import { logger } from "./logging";

/**
 * Loads a locale from the file system.
 * @param language Language of the locale to load.
 * @returns Contents of the locale
 */
export function fileSystemLocaleProvider(language: Language): JsonObject | null {
	const filePath = path.join(process.cwd(), `${language}.json`);
	if (!fs.existsSync(filePath)) {
		return null;
	}

	try {
		// Parse the translations from the file.
		const contents = JSON.parse(fs.readFileSync(filePath, { flag: "r" })?.toString());
		if (contents !== undefined && typeof contents === "object" && "Localization" in contents) {
			return contents["Localization"];
		}

		throw new TypeError(`Translations must be a JSON object nested under a property named "Localization"`);
	} catch (err) {
		logger.error(`Failed to load translations from ${filePath}`, err);
		return null;
	}
}
