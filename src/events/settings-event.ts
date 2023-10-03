import { DidReceiveGlobalSettings } from "../connectivity/events";
import { Event } from "./event";

/**
 * Provides event information for when the plugin received the global settings.
 */
export class DidReceiveGlobalSettingsEvent<TSettings extends object> extends Event<DidReceiveGlobalSettings<TSettings>> {
	/**
	 * Settings associated with the event.
	 */
	public readonly settings: TSettings;

	/**
	 * Initializes a new instance of the {@link DidReceiveGlobalSettingsEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(source: DidReceiveGlobalSettings<TSettings>) {
		super(source);
		this.settings = source.payload.settings;
	}
}
