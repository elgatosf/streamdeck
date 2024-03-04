import type { PayloadObject } from "../api";

/**
 * Provides a contextualized instance of an {@link Action}, allowing for direct communication with the Stream Deck.
 * @template T The type of settings associated with the action.
 */
export type Action<T extends PayloadObject<T>> = {
	/**
	 * Unique identifier of the instance of the action; this can be used to update the action on the Stream Deck, e.g. its title, settings, etc.
	 */
	readonly id: string;

	/**
	 * Unique identifier (UUID) of the action as defined within the plugin's manifest's actions collection.
	 */
	readonly manifestId: string;

	/**
	 * Gets the settings associated this action instance. See also {@link Action.setSettings}.
	 * @template U The type of settings associated with the action.
	 * @returns Promise containing the action instance's settings.
	 */
	getSettings<U extends PayloadObject<U> = T>(): Promise<U>;

	/**
	 * Sets the {@link settings} associated with this action instance. Use in conjunction with {@link Action.getSettings}.
	 * @param settings Settings to persist.
	 * @returns `Promise` resolved when the {@link settings} are sent to Stream Deck.
	 */
	setSettings(settings: T): Promise<void>;
};
