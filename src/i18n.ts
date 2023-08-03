import file from "node:fs";
import path from "node:path";

import { logger } from "./common/logging";
import { get } from "./common/utils";
import { Language, supportedLanguages } from "./connectivity/registration";

/**
 * Provides locales and translations for internalization.
 */
export class I18nProvider {
	/**
	 * Determines whether a log should be written when a resource could not be found.
	 */
	public logMissingKey = true;

	/**
	 * Default language to be used when a resource does not exist for the desired language.
	 */
	private static readonly DEFAULT_LANGUAGE: Language = "en";

	/**
	 * Collection of loaded locales and their translations.
	 */
	private readonly locales = new Map<Language, unknown>();

	/**
	 * Initializes a new instance of the {@link I18nProvider} class.
	 * @param language The default language to be used when retrieving translations for a given key.
	 */
	constructor(private readonly language: Language) {
		this.loadLocales();
	}

	/**
	 * Gets the translation for the specified {@link key} from the resources defined for {@link language}. When the key is not found, the default language is checked.
	 * @param key Key that represents the translation.
	 * @param language Optional language to get the translation for; otherwise the default language.
	 * @returns The translation; otherwise an empty string.
	 */
	public translate(key: string, language: Language | undefined = this.language): string {
		const translation = this.translateOrDefault(key, language);

		if (translation === undefined && this.logMissingKey) {
			logger.logWarn(`Missing translation: ${key}`);
		}

		return translation || "";
	}

	/**
	 * Loads all known locales from the current working directory.
	 */
	private loadLocales() {
		for (const filePath of file.readdirSync(process.cwd())) {
			const { ext, name } = path.parse(filePath);
			const lng = name as Language;

			if (ext.toLowerCase() == ".json" && supportedLanguages.includes(lng)) {
				const contents = this.readFile(filePath);
				if (contents !== undefined) {
					this.locales.set(lng, contents);
				}
			}
		}

		this.mergeManifestWithDefault();
	}

	/**
	 * Merges the default language (English) with the manifest; when there are duplicate keys, the default language resources will take precedence over the manifest.
	 */
	private mergeManifestWithDefault() {
		const manifest = this.readFile(path.join(process.cwd(), "manifest.json"));

		if (manifest !== undefined) {
			this.locales.set(I18nProvider.DEFAULT_LANGUAGE, {
				...manifest,
				...(this.locales.get(I18nProvider.DEFAULT_LANGUAGE) || {})
			});
		}
	}

	/**
	 * Reads the contents of the {@link filePath} and parses it as JSON.
	 * @param filePath File path to read.
	 * @returns Parsed object; otherwise `undefined`.
	 */
	private readFile(filePath: string): unknown | undefined {
		try {
			const contents = file.readFileSync(filePath, { flag: "r" })?.toString();
			return JSON.parse(contents);
		} catch (err) {
			logger.logError(`Failed to load translations from ${filePath}`, err);
		}
	}

	/**
	 * Gets the resource for the specified {@link key}; when the resource is not available for the {@link language}, the default language is used.
	 * @param key Key that represents the translation.
	 * @param language Language to retrieve the resource from.
	 * @returns The resource; otherwise the default language's resource, or `undefined`.
	 */
	private translateOrDefault(key: string, language: Language = this.language): string | undefined {
		// When the language and default are the same, only check the language.
		if (language === I18nProvider.DEFAULT_LANGUAGE) {
			return get(key, this.locales.get(language))?.toString();
		}

		// Otherwise check the language and default.
		return get(key, this.locales.get(language))?.toString() || get(key, this.locales.get(I18nProvider.DEFAULT_LANGUAGE))?.toString();
	}
}
