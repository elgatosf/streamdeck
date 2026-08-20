import type { Alphabetical } from "../types.js";

/**
 * Default language supported by all i18n providers.
 */
export const defaultLanguage = "en" as const;

/**
 * Extracts the first portion of strings that include a hyphen.
 */
export type Language<T extends string> = ExtractLanguage<T> | typeof defaultLanguage;

/**
 * Extracts the languages from a union of languages or regionalized languages
 */
type ExtractLanguage<T extends string> = T extends `_` | `-` | ``
	? never
	: T extends Alphabetical<T>
		? T
		: T extends `${infer L}${`_` | `-`}${infer R}`
			? L extends Alphabetical<L>
				? R extends Alphabetical<R>
					? L | T
					: never
				: never
			: never;
