import type { JsonObject } from "@elgato/utils";

/**
 * Provides a cache for action settings, keyed by action instance identifier.
 */
class SettingsCache {
	/**
	 * Underlying map of action ID to cached settings.
	 */
	readonly #entries = new Map<string, JsonObject>();

	/**
	 * Removes the cached settings for the specified action.
	 * @param id Action instance identifier.
	 */
	public delete(id: string): void {
		this.#entries.delete(id);
	}

	/**
	 * Gets the cached settings for the specified action.
	 * @param id Action instance identifier.
	 * @returns The cached settings when present; otherwise `undefined`.
	 */
	public get(id: string): JsonObject | undefined {
		return this.#entries.get(id);
	}

	/**
	 * Sets the cached settings for the specified action.
	 * @param id Action instance identifier.
	 * @param settings The settings to cache.
	 */
	public set(id: string, settings: JsonObject): void {
		this.#entries.set(id, settings);
	}
}

/**
 * Singleton instance of the settings cache.
 */
export const settingsCache = new SettingsCache();
