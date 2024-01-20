import type { DidReceiveSettings, TitleParametersDidChange, WillAppear, WillDisappear } from "./action";
import type { DeviceDidConnect, DeviceDidDisconnect } from "./device";
import type { DialDown, DialRotate, DialUp, TouchTap } from "./encoder";
import type { KeyDown, KeyUp } from "./keypad";
import type { PropertyInspectorDidAppear, PropertyInspectorDidDisappear, SendToPlugin } from "./property-inspector";
import type { ApplicationDidLaunch, ApplicationDidTerminate, DidReceiveDeepLink, DidReceiveGlobalSettings, SystemDidWakeUp } from "./system";

export type { ActionIdentifier, Controller, State } from "./action";
export type { DeviceIdentifier } from "./device";

export type { Coordinates, DidReceiveSettings, TitleParametersDidChange, WillAppear, WillDisappear } from "./action";
export type { DeviceDidConnect, DeviceDidDisconnect } from "./device";
export type { DialDown, DialRotate, DialUp, TouchTap } from "./encoder";
export type { KeyDown, KeyUp } from "./keypad";
export type { PropertyInspectorDidAppear, PropertyInspectorDidDisappear, SendToPlugin } from "./property-inspector";
export type { ApplicationDidLaunch, ApplicationDidTerminate, DidReceiveDeepLink, DidReceiveGlobalSettings, SystemDidWakeUp } from "./system";

/**
 * Represents an event that is emitted by the Stream Deck.
 */
export type EventIdentifier<TEvent> = {
	/**
	 * Name of the event used to identify what occurred.
	 */
	readonly event: TEvent;
};

/**
 * Represents an object sent as part of the Stream Deck's API.
 */
export type PayloadObject<T extends object> = { [K in keyof T]: T[K] } extends RelativeIndexable<unknown> ? never : { [K in keyof T]: T[K] };

/**
 * Events received by the plugin, from the Stream Deck.
 */
export type EventMessage<T extends PayloadObject<T> = object> =
	| ApplicationDidLaunch
	| ApplicationDidTerminate
	| DeviceDidConnect
	| DeviceDidDisconnect
	| DialDown<T>
	| DialRotate<T>
	| DialUp<T>
	| DidReceiveDeepLink
	| DidReceiveGlobalSettings<T>
	| DidReceiveSettings<T>
	| KeyDown<T>
	| KeyUp<T>
	| PropertyInspectorDidAppear
	| PropertyInspectorDidDisappear
	| SendToPlugin<T>
	| SystemDidWakeUp
	| TitleParametersDidChange<T>
	| TouchTap<T>
	| WillAppear<T>
	| WillDisappear<T>;

/**
 * Map of events received by the plugin, from the Stream Deck.
 */
export type PluginEventMap = {
	[K in EventMessage["event"]]: [event: Extract<EventMessage, EventIdentifier<K>>];
};
