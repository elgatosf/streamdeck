import { DidReceiveSettings, TitleParametersDidChange, WillAppear, WillDisappear } from "./action";
import { DeviceDidConnect, DeviceDidDisconnect } from "./device";
import { DialDown, DialRotate, DialUp, TouchTap } from "./encoder";
import { KeyDown, KeyUp } from "./keypad";
import { PropertyInspectorDidAppear, PropertyInspectorDidDisappear, SendToPlugin } from "./property-inspector";
import { ApplicationDidLaunch, ApplicationDidTerminate, DidReceiveDeepLink, DidReceiveGlobalSettings, SystemDidWakeUp } from "./system";

export { ActionIdentifier, State } from "./action";
export { DeviceIdentifier } from "./device";

export { Controller, Coordinates, DidReceiveSettings, TitleParametersDidChange, WillAppear, WillDisappear } from "./action";
export { DeviceDidConnect, DeviceDidDisconnect } from "./device";
export { DialDown, DialRotate, DialUp, TouchTap } from "./encoder";
export { KeyDown, KeyUp } from "./keypad";
export { PropertyInspectorDidAppear, PropertyInspectorDidDisappear, SendToPlugin } from "./property-inspector";
export { ApplicationDidLaunch, ApplicationDidTerminate, DidReceiveDeepLink, DidReceiveGlobalSettings, SystemDidWakeUp } from "./system";

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
export type Event<T extends PayloadObject<T> = object> =
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
export type EventMap = {
	[K in Event["event"]]: Extract<Event, EventIdentifier<K>>;
};
