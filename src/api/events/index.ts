import type { DidReceiveSettings, TitleParametersDidChange, WillAppear, WillDisappear } from "./action";
import type { DeviceDidConnect, DeviceDidDisconnect } from "./device";
import type { DialDown, DialRotate, DialUp, TouchTap } from "./encoder";
import type { KeyDown, KeyUp } from "./keypad";
import type { ApplicationDidLaunch, ApplicationDidTerminate, DidReceiveDeepLink, DidReceiveGlobalSettings, SystemDidWakeUp } from "./system";
import type { DidReceivePluginMessage, DidReceivePropertyInspectorMessage, PropertyInspectorDidAppear, PropertyInspectorDidDisappear } from "./ui";

export { Controller } from "@elgato/schemas/streamdeck/plugins";
export { ActionIdentifier, State } from "./action";
export { DeviceIdentifier } from "./device";

export { Coordinates, DidReceiveSettings, TitleParametersDidChange, WillAppear, WillDisappear } from "./action";
export { DeviceDidConnect, DeviceDidDisconnect } from "./device";
export { DialDown, DialRotate, DialUp, TouchTap } from "./encoder";
export { KeyDown, KeyUp } from "./keypad";
export { ApplicationDidLaunch, ApplicationDidTerminate, DidReceiveDeepLink, DidReceiveGlobalSettings, SystemDidWakeUp } from "./system";
export { DidReceivePluginMessage, DidReceivePropertyInspectorMessage, PropertyInspectorDidAppear, PropertyInspectorDidDisappear } from "./ui";

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
 * Represents an object sent as part of Stream Deck's API.
 */
export type PayloadObject<T extends object> = { [K in keyof T]: T[K] } extends RelativeIndexable<unknown> ? never : { [K in keyof T]: T[K] };

/**
 * Events received by the plugin, from Stream Deck.
 */
export type PluginEvent<T extends PayloadObject<T> = object> =
	| ApplicationDidLaunch
	| ApplicationDidTerminate
	| DeviceDidConnect
	| DeviceDidDisconnect
	| DialDown<T>
	| DialRotate<T>
	| DialUp<T>
	| DidReceiveDeepLink
	| DidReceiveGlobalSettings<T>
	| DidReceivePropertyInspectorMessage<T>
	| DidReceiveSettings<T>
	| KeyDown<T>
	| KeyUp<T>
	| PropertyInspectorDidAppear
	| PropertyInspectorDidDisappear
	| SystemDidWakeUp
	| TitleParametersDidChange<T>
	| TouchTap<T>
	| WillAppear<T>
	| WillDisappear<T>;

/**
 * Map of events received by the plugin, from Stream Deck.
 */
export type PluginEventMap = {
	[K in PluginEvent["event"]]: [event: Extract<PluginEvent, EventIdentifier<K>>];
};

/**
 * Events received by the UI, from Stream Deck.
 */
export type UIEvent<T extends PayloadObject<T> = object> = DidReceiveGlobalSettings<T> | DidReceivePluginMessage<T> | DidReceiveSettings<T>;

/**
 * Map of events received by the UI, from Stream Deck.
 */
export type UIEventMap = {
	[K in UIEvent["event"]]: [event: Extract<UIEvent, EventIdentifier<K>>];
};
