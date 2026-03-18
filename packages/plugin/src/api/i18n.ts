/**
 * Languages supported by Stream Deck.
 */
export const supportedLanguages = ["de", "en", "es", "fr", "ja", "ko", "zh_CN", "zh_TW"] as const;

/**
 * Language supported by Stream Deck
 */
export type Language = (typeof supportedLanguages)[number];
