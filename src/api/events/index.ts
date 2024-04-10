import type { JsonObject, JsonValue } from "../../common/json";
import type { DidReceiveSettings, TitleParametersDidChange, WillAppear, WillDisappear } from "./action";
import type { DeviceDidConnect, DeviceDidDisconnect } from "./device";
import type { DialDown, DialRotate, DialUp, TouchTap } from "./encoder";
import type { KeyDown, KeyUp } from "./keypad";
import type { ApplicationDidLaunch, ApplicationDidTerminate, DidReceiveDeepLink, DidReceiveGlobalSettings, SystemDidWakeUp } from "./system";
import type { DidReceivePluginMessage, DidReceivePropertyInspectorMessage, PropertyInspectorDidAppear, PropertyInspectorDidDisappear } from "./ui";

export { type Controller } from "@elgato/schemas/streamdeck/plugins";
export { type ActionIdentifier, type State } from "./action";
export { type DeviceIdentifier } from "./device";

export { type Coordinates, type DidReceiveSettings, type TitleParametersDidChange, type WillAppear, type WillDisappear } from "./action";
export { type DeviceDidConnect, type DeviceDidDisconnect } from "./device";
export { type DialDown, type DialRotate, type DialUp, type TouchTap } from "./encoder";
export { type KeyDown, type KeyUp } from "./keypad";
export { type ApplicationDidLaunch, type ApplicationDidTerminate, type DidReceiveDeepLink, type DidReceiveGlobalSettings, type SystemDidWakeUp } from "./system";
export { type DidReceivePluginMessage, type DidReceivePropertyInspectorMessage, type PropertyInspectorDidAppear, type PropertyInspectorDidDisappear } from "./ui";

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
	| DeviceDidConnect
	| DeviceDidDisconnect
	| DialDown<JsonObject>
	| DialRotate<JsonObject>
	| DialUp<JsonObject>
	| DidReceiveDeepLink
	| DidReceiveGlobalSettings<JsonObject>
	| DidReceivePropertyInspectorMessage<JsonValue>
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

/**
 * Events received by the UI, from Stream Deck.
 */
export type UIEvent = DidReceiveGlobalSettings<JsonObject> | DidReceivePluginMessage<JsonValue> | DidReceiveSettings<JsonObject>;

/**
 * Map of events received by the UI, from Stream Deck.
 */
export type UIEventMap = {
	[K in UIEvent["event"]]: [event: Extract<UIEvent, EventIdentifier<K>>];
};
