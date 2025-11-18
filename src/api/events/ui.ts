import type { JsonValue } from "../../common/json.js";
import type { ActionEventMessage, ActionEventMessageWithoutPayload } from "./action.js";
import type { DeviceIdentifier } from "./device.js";

/**
 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. See also {@link PropertyInspectorDidDisappear}.
 */
export type PropertyInspectorDidAppear = ActionEventMessageWithoutPayload<"propertyInspectorDidAppear">;

/**
 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. See also {@link PropertyInspectorDidAppear}.
 */
export type PropertyInspectorDidDisappear = ActionEventMessageWithoutPayload<"propertyInspectorDidDisappear">;

/**
 * Message sent between the plugin and it's respective UI.
 */
type PluginMessage<TEvent extends string, TPayload extends JsonValue> = Omit<
	ActionEventMessage<TEvent, TPayload>,
	keyof DeviceIdentifier
>;

/**
 * Occurs when a payload was received from the UI.
 */
export type DidReceivePropertyInspectorMessage<TPayload extends JsonValue> = PluginMessage<"sendToPlugin", TPayload>;
