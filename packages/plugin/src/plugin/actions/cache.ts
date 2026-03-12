import type { JsonObject } from "@elgato/utils";

/**
 * Cache entry that tracks settings and their validity.
 */
type CacheEntry = {
	/**
	 * The cached settings.
	 */
	settings: JsonObject;
	/**
	 * Whether the cached settings are valid.
	 */
	valid: boolean;
};

/**
 * Provides a cache for action settings, keyed by action instance identifier.
 */
class SettingsCache {
	/**
	 * Underlying map of action ID to cache entry.
	 */
	readonly #entries = new Map<string, CacheEntry>();

	/**
	 * Removes the cached settings for the specified action.
	 * @param id Action instance identifier.
	 */
	public delete(id: string): void {
		this.#entries.delete(id);
	}

	/**
	 * Gets the cached settings for the specified action, if valid.
	 * @param id Action instance identifier.
	 * @returns The cached settings when valid; otherwise `undefined`.
	 */
	public get(id: string): JsonObject | undefined {
		const entry = this.#entries.get(id);
		return entry?.valid ? entry.settings : undefined;
	}

	/**
	 * Invalidates the cached settings for the specified action.
	 * @param id Action instance identifier.
	 */
	public invalidate(id: string): void {
		const entry = this.#entries.get(id);
		if (entry) {
			entry.valid = false;
		}
	}

	/**
	 * Sets the cached settings for the specified action, marking them as valid.
	 * @param id Action instance identifier.
	 * @param settings The settings to cache.
	 */
	public set(id: string, settings: JsonObject): void {
		this.#entries.set(id, { settings, valid: true });
	}
}

/**
 * Singleton instance of the settings cache.
 */
export const settingsCache = new SettingsCache();
