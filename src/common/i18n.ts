import { supportedLanguages, type Language } from "../api";
import { JsonObject } from "../common/json";
import { freeze, get } from "./utils";

/**
 * Internalization provider, responsible for managing localizations and translating resources.
 */
export class I18nProvider {
	/**
	 * Default language to be used when a resource does not exist for the desired language.
	 */
	private static readonly DEFAULT_LANGUAGE: Language = "en";

	/**
	 * Map of localized resources, indexed by their language.
	 */
	private readonly _translations: Map<Language, JsonObject | null> = new Map();

	/**
	 * Initializes a new instance of the {@link I18nProvider} class.
	 * @param language The default language to be used when retrieving translations for a given key.
	 * @param readTranslations Function responsible for loading translations.
	 */
	constructor(
		private readonly language: Language,
		private readonly readTranslations: TranslationsReader
	) {}

	/**
	 * Translates the specified {@link key}, as defined within the resources for the {@link language}. When the key is not found, the default language is checked.
	 *
	 * Alias of `I18nProvider.translate(string, Language)`
	 * @param key Key of the translation.
	 * @param language Optional language to get the translation for; otherwise the default language.
	 * @returns The translation; otherwise the key.
	 */
	public t(key: string, language: Language = this.language): string {
		return this.translate(key, language);
	}

	/**
	 * Translates the specified {@link key}, as defined within the resources for the {@link language}. When the key is not found, the default language is checked.
	 * @param key Key of the translation.
	 * @param language Optional language to get the translation for; otherwise the default language.
	 * @returns The translation; otherwise the key.
	 */
	public translate(key: string, language: Language = this.language): string {
		// When the language and default are the same, only check the language.
		if (language === I18nProvider.DEFAULT_LANGUAGE) {
			return get(key, this.getTranslations(language))?.toString() || key;
		}

		// Otherwise check the language and default.
		return get(key, this.getTranslations(language))?.toString() || get(key, this.getTranslations(I18nProvider.DEFAULT_LANGUAGE))?.toString() || key;
	}

	/**
	 * Gets the translations for the specified language.
	 * @param language Language whose translations are being retrieved.
	 * @returns The translations, otherwise `null`.
	 */
	private getTranslations(language: Language): JsonObject | null {
		let translations = this._translations.get(language);

		if (translations === undefined) {
			translations = supportedLanguages.includes(language) ? this.readTranslations(language) : null;
			freeze(translations);

			this._translations.set(language, translations);
		}

		return translations;
	}
}

/**
 * Function responsible for providing localized resources.
 * @param language The language whose resources should be retrieved.
 * @returns Localized resources represented as a JSON object.
 */
export type TranslationsReader = (language: Language) => JsonObject | null;

/**
 * Parses the localizations from the specified contents, or throws a `TypeError` when unsuccessful.
 * @param contents Contents that represent the stringified JSON containing the localizations.
 * @returns The localizations; otherwise a `TypeError`.
 */
export function parseLocalizations(contents: string): JsonObject {
	const json = JSON.parse(contents);
	if (json !== undefined && json !== null && typeof json === "object" && "Localization" in json) {
		return json["Localization"] as JsonObject;
	}

	throw new TypeError(`Translations must be a JSON object nested under a property named "Localization"`);
}
