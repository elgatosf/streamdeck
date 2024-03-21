import type { JsonValue } from "../../common/json";
import type { ActionEventMessage } from "./action";
import type { DeviceIdentifier } from "./device";

/**
 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link PropertyInspectorDidDisappear}.
 */
export type PropertyInspectorDidAppear = ActionEventMessage<"propertyInspectorDidAppear">;

/**
 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link PropertyInspectorDidAppear}.
 */
export type PropertyInspectorDidDisappear = ActionEventMessage<"propertyInspectorDidDisappear">;

/**
 * Message sent between the plugin and it's respective UI.
 */
type PluginMessage<TEvent extends string, TPayload extends JsonValue> = Omit<ActionEventMessage<TEvent>, keyof DeviceIdentifier> & {
	/**
	 * Payload sent between the plugin and it's UI.
	 */
	readonly payload: TPayload;
};

/**
 * Occurs when a payload was received from the UI.
 */
export type DidReceivePropertyInspectorMessage<TPayload extends JsonValue> = PluginMessage<"sendToPlugin", TPayload>;

/**
 * Occurs when a message was received from the plugin.
 */
export type DidReceivePluginMessage<TPayload extends JsonValue> = PluginMessage<"sendToPropertyInspector", TPayload>;
