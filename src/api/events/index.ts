import type { JsonObject, JsonValue } from "../../common/json";
import type {
	DidReceiveResources,
	DidReceiveSettings,
	TitleParametersDidChange,
	WillAppear,
	WillDisappear,
} from "./action";
import type { DeviceDidChange, DeviceDidConnect, DeviceDidDisconnect } from "./device";
import type { DialDown, DialRotate, DialUp, TouchTap } from "./encoder";
import type { KeyDown, KeyUp } from "./keypad";
import type {
	ApplicationDidLaunch,
	ApplicationDidTerminate,
	DidReceiveDeepLink,
	DidReceiveGlobalSettings,
	DidReceiveSecrets,
	SystemDidWakeUp,
} from "./system";
import type {
	DidReceivePropertyInspectorMessage,
	PropertyInspectorDidAppear,
	PropertyInspectorDidDisappear,
} from "./ui";

export { type Controller } from "@elgato/schemas/streamdeck/plugins";
export { type ActionIdentifier, type State } from "./action";
export { type DeviceIdentifier } from "./device";

export {
	type Coordinates,
	type DidReceiveResources,
	type DidReceiveSettings,
	type TitleParametersDidChange,
	type WillAppear,
	type WillDisappear,
} from "./action";
export { type DeviceDidChange, type DeviceDidConnect, type DeviceDidDisconnect } from "./device";
export { type DialDown, type DialRotate, type DialUp, type TouchTap } from "./encoder";
export { type KeyDown, type KeyUp } from "./keypad";
export {
	type ApplicationDidLaunch,
	type ApplicationDidTerminate,
	type DidReceiveDeepLink,
	type DidReceiveGlobalSettings,
	type SystemDidWakeUp,
} from "./system";
export {
	type DidReceivePropertyInspectorMessage,
	type PropertyInspectorDidAppear,
	type PropertyInspectorDidDisappear,
} from "./ui";

/**
 * Represents an event that is emitted by Stream Deck.
 */
export type EventIdentifier<TEvent> = {
	/**
	 * Name of the event used to identify what occurred.
	 */
	readonly event: TEvent;
};

/**
 * Events received by the plugin, from Stream Deck.
 */
export type PluginEvent =
	| ApplicationDidLaunch
	| ApplicationDidTerminate
	| DeviceDidChange
	| DeviceDidConnect
	| DeviceDidDisconnect
	| DialDown<JsonObject>
	| DialRotate<JsonObject>
	| DialUp<JsonObject>
	| DidReceiveDeepLink
	| DidReceiveGlobalSettings<JsonObject>
	| DidReceivePropertyInspectorMessage<JsonValue>
	| DidReceiveResources<JsonObject>
	| DidReceiveSecrets<JsonObject>
	| DidReceiveSettings<JsonObject>
	| KeyDown<JsonObject>
	| KeyUp<JsonObject>
	| PropertyInspectorDidAppear
	| PropertyInspectorDidDisappear
	| SystemDidWakeUp
	| TitleParametersDidChange<JsonObject>
	| TouchTap<JsonObject>
	| WillAppear<JsonObject>
	| WillDisappear<JsonObject>;

/**
 * Map of events received by the plugin, from Stream Deck.
 */
export type PluginEventMap = {
	[K in PluginEvent["event"]]: [event: Extract<PluginEvent, EventIdentifier<K>>];
};
