import type { ActionEvent } from "./action";
import type { DeviceIdentifier } from "./device";
import type { PayloadObject } from "./index";

/**
 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link PropertyInspectorDidDisappear}.
 */
export type PropertyInspectorDidAppear = ActionEvent<"propertyInspectorDidAppear">;

/**
 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link PropertyInspectorDidAppear}.
 */
export type PropertyInspectorDidDisappear = ActionEvent<"propertyInspectorDidDisappear">;

/**
 * Occurs when a message was sent to the plugin _from_ the property inspector.
 */
export type SendToPlugin<TPayload extends PayloadObject<TPayload>> = Omit<ActionEvent<"sendToPlugin">, keyof DeviceIdentifier> & {
	/**
	 * Payload sent to the plugin from the property inspector.
	 */
	readonly payload: TPayload;
};
