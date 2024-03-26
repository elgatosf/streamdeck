import type { DidReceivePluginMessage, DidReceiveSettings } from "../api";
import type { ActionEvent, Event } from "../common/events";
import type { JsonObject, JsonValue } from "../common/json";
import type { Action } from "./action";

export { DidReceiveGlobalSettingsEvent } from "../common/events";

/**
 * Event information received from Stream Deck when the plugin sends a message to the UI.
 */
export type SendToPropertyInspectorEvent<TPayload extends JsonValue, TSettings extends JsonObject> = Event<DidReceivePluginMessage<TPayload>> & {
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
export type DidReceiveSettingsEvent<TSettings extends JsonObject> = ActionEvent<DidReceiveSettings<TSettings>, Action<TSettings>>;
