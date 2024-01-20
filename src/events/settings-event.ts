import type { DidReceiveGlobalSettings, PayloadObject } from "../api/events";
import { Event } from "./event";

/**
 * Provides event information for when the plugin received the global settings.
 */
export class DidReceiveGlobalSettingsEvent<T extends PayloadObject<T>> extends Event<DidReceiveGlobalSettings<T>> {
	/**
	 * Settings associated with the event.
	 */
	public readonly settings: T;

	/**
	 * Initializes a new instance of the {@link DidReceiveGlobalSettingsEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(source: DidReceiveGlobalSettings<T>) {
		super(source);
		this.settings = source.payload.settings;
	}
}
