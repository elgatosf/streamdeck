import type { ActionIdentifier } from "../../api";

/**
 * Provides context for an action.
 */
export class ActionContext {
	/**
	 * Unique identifier of the instance of the action; this can be used to update the action on the Stream Deck, e.g. its title, settings, etc.
	 */
	public readonly id: string;

	/**
	 * Unique identifier (UUID) of the action as defined within the plugin's manifest's actions collection.
	 */
	public readonly manifestId: string;

	/**
	 * Initializes a new instance of the {@see ActionContext} class.
	 * @param source Source of the context.
	 */
	constructor(source: ActionIdentifier) {
		this.id = source.context;
		this.manifestId = source.action;
	}
}
