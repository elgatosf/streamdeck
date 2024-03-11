import type { DidReceivePluginMessage, DidReceiveSettings, PayloadObject } from "../api";
import type { ActionEvent, Event } from "../common/events";
import type { Action } from "./action";

export { DidReceiveGlobalSettingsEvent } from "../common/events";

/**
 * Event information received from Stream Deck when the plugin sends a message to the UI.
 */
export type DidReceivePluginMessageEvent<TPayload extends PayloadObject<TPayload>, TSettings extends PayloadObject<TSettings>> = Event<DidReceivePluginMessage<object>> & {
	/**
	 * Action that raised the event.
	 */
	action: Action<TSettings>;

	/**
	 * Payload sent from the plugin.
	 */
	payload: TPayload;
};

/**
 * Event information received from Stream Deck when the UI receives settings.
 */
export type DidReceiveSettingsEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<DidReceiveSettings<TSettings>, Action<TSettings>>;
