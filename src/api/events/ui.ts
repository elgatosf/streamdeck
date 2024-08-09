import type { JsonValue } from "../../common/json";
import type { ActionEventMessage, ActionEventMessageWithoutPayload } from "./action";
import type { DeviceIdentifier } from "./device";

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
type PluginMessage<TEvent extends string, TPayload extends JsonValue> = Omit<ActionEventMessage<TEvent, TPayload>, keyof DeviceIdentifier>;

/**
 * Occurs when a payload was received from the UI.
 */
export type DidReceivePropertyInspectorMessage<TPayload extends JsonValue> = PluginMessage<"sendToPlugin", TPayload>;

/**
 * Occurs when a message was received from the plugin.
 */
export type DidReceivePluginMessage<TPayload extends JsonValue> = PluginMessage<"sendToPropertyInspector", TPayload>;
