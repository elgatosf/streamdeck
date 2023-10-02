import { DidReceiveSettings, TitleParametersDidChange, WillAppear, WillDisappear } from "./action";
import { DeviceDidConnect, DeviceDidDisconnect } from "./device";
import { DialDown, DialRotate, DialUp, TouchTap } from "./encoder";
import { KeyDown, KeyUp } from "./keypad";
import { PropertyInspectorDidAppear, PropertyInspectorDidDisappear, SendToPlugin } from "./property-inspector";
import { ApplicationDidLaunch, ApplicationDidTerminate, DidReceiveGlobalSettings, SystemDidWakeUp } from "./system";

export { ActionIdentifier, State } from "./action";
export { DeviceIdentifier } from "./device";

export { DidReceiveSettings, TitleParametersDidChange, WillAppear, WillDisappear } from "./action";
export { DeviceDidConnect, DeviceDidDisconnect } from "./device";
export { DialDown, DialRotate, DialUp, TouchTap } from "./encoder";
export { KeyDown, KeyUp } from "./keypad";
export { PropertyInspectorDidAppear, PropertyInspectorDidDisappear, SendToPlugin } from "./property-inspector";
export { ApplicationDidLaunch, ApplicationDidTerminate, DidReceiveGlobalSettings, SystemDidWakeUp } from "./system";

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
 * Events received by the plugin, from the Stream Deck.
 */
export type Event<TSettings = unknown> =
	| ApplicationDidLaunch
	| ApplicationDidTerminate
	| DeviceDidConnect
	| DeviceDidDisconnect
	| DialDown<TSettings>
	| DialRotate<TSettings>
	| DialUp<TSettings>
	| DidReceiveGlobalSettings
	| DidReceiveSettings<TSettings>
	| KeyDown<TSettings>
	| KeyUp<TSettings>
	| PropertyInspectorDidAppear
	| PropertyInspectorDidDisappear
	| SendToPlugin
	| SystemDidWakeUp
	| TitleParametersDidChange<TSettings>
	| TouchTap<TSettings>
	| WillAppear<TSettings>
	| WillDisappear<TSettings>;
