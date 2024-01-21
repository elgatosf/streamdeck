/**
 * Languages supported by Stream Deck.
 */
export const supportedLanguages = ["de", "en", "es", "fr", "ja", "zh_CN"] as const;

/**
 * Language supported by Stream Deck
 */
export type Language = (typeof supportedLanguages)[number];
