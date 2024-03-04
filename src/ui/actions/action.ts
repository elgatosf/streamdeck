import type { ActionIdentifier, PayloadObject } from "../../api";
import { connection } from "../connection";

/**
 * Provides a contextualized instance of an {@link Action}, allowing for direct communication with the Stream Deck.
 * @template T The type of settings associated with the action.
 */
export class Action<T extends PayloadObject<T> = object> {
	/**
	 * Unique identifier of the instance of the action; this can be used to update the action on the Stream Deck, e.g. its title, settings, etc.
	 */
	public readonly id: string;

	/**
	 * Unique identifier (UUID) of the action as defined within the plugin's manifest's actions collection.
	 */
	public readonly manifestId: string;

	/**
	 * Initializes a new instance of the {@see Action} class.
	 * @param source Source of the action.
	 */
	constructor(source: ActionIdentifier) {
		this.id = source.context;
		this.manifestId = source.action;
	}

	/**
	 * Sets the {@link settings} associated with this action instance. Use in conjunction with {@link Action.getSettings}.
	 * @param settings Settings to persist.
	 * @returns `Promise` resolved when the {@link settings} are sent to Stream Deck.
	 */
	public setSettings(settings: T): Promise<void> {
		return connection.send({
			event: "setSettings",
			context: this.id,
			payload: settings
		});
	}
}
