import { EventEmitter } from "../event-emitter.js";
import type { IDisposable } from "../explicit-resource-management/disposable.js";
import type { JsonObject } from "../json.js";
import { freeze, get } from "../objects.js";
import { defaultLanguage, type Language } from "./language.js";

/**
 * Internalization provider, responsible for managing localizations and translating resources.
 */
export class I18nProvider<T extends string> {
	/**
	 * Backing field for the default language.
	 */
	#language: Language<T>;

	/**
	 * Map of localized resources, indexed by their language.
	 */
	readonly #translations: Map<Language<T>, JsonObject | null> = new Map();

	/**
	 * Function responsible for providing localized resources for a given language.
	 */
	readonly #readTranslations: TranslationsReader<T>;

	/**
	 * Internal events handler.
	 */
	readonly #events = new EventEmitter<I18nProviderEventMap<T>>();

	/**
	 * Initializes a new instance of the {@link I18nProvider} class.
	 * @param language The default language to be used when retrieving translations for a given key.
	 * @param readTranslations Function responsible for providing localized resources for a given language.
	 */
	constructor(language: Language<T>, readTranslations: TranslationsReader<T>) {
		this.#language = language;
		this.#readTranslations = readTranslations;
	}

	/**
	 * The default language of the provider.
	 * @returns The language.
	 */
	public get language(): Language<T> {
		return this.#language;
	}

	/**
	 * The default language of the provider.
	 * @param value The language.
	 */
	public set language(value: Language<T>) {
		if (this.#language !== value) {
			this.#language = value;
			this.#events.emit("languageChange", value);
		}
	}

	/**
	 * Adds an event listener that is called when the language within the provider changes.
	 * @param listener Listener function to be called.
	 * @returns Resource manager that, when disposed, removes the event listener.
	 */
	public onLanguageChange(listener: (language: Language<T>) => void): IDisposable {
		return this.#events.disposableOn("languageChange", listener);
	}

	/**
	 * Translates the specified {@link key}, as defined within the resources for the {@link language}.
	 * When the key is not found, the default language is checked. Alias of {@link I18nProvider.translate}.
	 * @param key Key of the translation.
	 * @param language Optional language to get the translation for; otherwise the default language.
	 * @returns The translation; otherwise the key.
	 */
	public t(key: string, language: Language<T> = this.language): string {
		return this.translate(key, language);
	}

	/**
	 * Translates the specified {@link key}, as defined within the resources for the {@link language}.
	 * When the key is not found, the default language is checked.
	 * @param key Key of the translation.
	 * @param language Optional language to get the translation for; otherwise the default language.
	 * @returns The translation; otherwise the key.
	 */
	public translate(key: string, language: Language<T> = this.language): string {
		// Determine the languages to search for.
		const languages = new Set<Language<T>>([
			language,
			language.replaceAll("_", "-").split("-").at(0) as Language<T>,
			defaultLanguage,
		]);

		// Attempt to find the resource for the languages.
		for (const language of languages) {
			const resource = get(this.getTranslations(language), key);
			if (resource) {
				return resource.toString();
			}
		}

		// Otherwise fallback to the key.
		return key;
	}

	/**
	 * Gets the translations for the specified language.
	 * @param language Language whose translations are being retrieved.
	 * @returns The translations; otherwise `null`.
	 */
	private getTranslations(language: Language<T>): JsonObject | null {
		let translations = this.#translations.get(language);

		if (translations === undefined) {
			translations = this.#readTranslations(language);
			freeze(translations);

			this.#translations.set(language, translations);
		}

		return translations;
	}
}

/**
 * Events that can occur as part of the {@link I18nProvider}.
 */
type I18nProviderEventMap<T extends string> = {
	/**
	 * Occurs when the language changes.
	 */
	languageChange: [language: Language<T>];
};

/**
 * Function responsible for providing localized resources for a given language.
 * @param language The language whose resources should be retrieved.
 * @returns Localized resources represented as a JSON object.
 */
export type TranslationsReader<T extends string> = (language: Language<T>) => JsonObject | null;
