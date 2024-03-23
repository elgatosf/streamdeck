import type {
	ApplicationDidLaunch,
	ApplicationDidTerminate,
	DeviceDidConnect,
	DeviceDidDisconnect,
	DialDown,
	DialRotate,
	DialUp,
	DidReceiveSettings,
	KeyDown,
	KeyUp,
	PropertyInspectorDidAppear,
	PropertyInspectorDidDisappear,
	SystemDidWakeUp,
	TitleParametersDidChange,
	TouchTap,
	WillAppear,
	WillDisappear
} from "../../api";
import { ActionWithoutPayloadEvent, Event, type ActionEvent } from "../../common/events";
import type { JsonObject } from "../../common/json";
import type { Action } from "../actions/action";
import type { Device } from "../devices";
import { ApplicationEvent } from "./application-event";
import { DeviceEvent } from "./device-event";

export { DidReceiveGlobalSettingsEvent } from "../../common/events";
export { DidReceiveDeepLinkEvent } from "./deep-link-event";
export { DidReceivePropertyInspectorMessageEvent } from "./ui-message-event";
export { ActionEvent, ActionWithoutPayloadEvent, ApplicationEvent, DeviceEvent, Event };

/**
 * Event information received from Stream Deck when a monitored application launches.
 */
export type ApplicationDidLaunchEvent = ApplicationEvent<ApplicationDidLaunch>;

/**
 * Event information received from Stream Deck when a monitored application terminates.
 */
export type ApplicationDidTerminateEvent = ApplicationEvent<ApplicationDidTerminate>;

/**
 * Event information received from Stream Deck when a Stream Deck device connects.
 */
export type DeviceDidConnectEvent = DeviceEvent<DeviceDidConnect, Required<Device>>;

/**
 * Event information received from Stream Deck when a Stream Deck device disconnected.
 */
export type DeviceDidDisconnectEvent = DeviceEvent<DeviceDidDisconnect, Device>;

/**
 * Event information received from Stream Deck when a dial is pressed down.
 */
export type DialDownEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<DialDown<TSettings>, Action<TSettings>>;

/**
 * Event information received from Stream Deck when a dial is rotated.
 */
export type DialRotateEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<DialRotate<TSettings>, Action<TSettings>>;

/**
 * Event information received from Stream Deck when a pressed dial is released.
 */
export type DialUpEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<DialUp<TSettings>, Action<TSettings>>;

/**
 * Event information received from Stream Deck when the plugin receives settings.
 */
export type DidReceiveSettingsEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<DidReceiveSettings<TSettings>, Action<TSettings>>;

/**
 * Event information received from Stream Deck when a key is pressed down.
 */
export type KeyDownEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<KeyDown<TSettings>, Action<TSettings>>;

/**
 * Event information received from Stream Deck when a pressed key is release.
 */
export type KeyUpEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<KeyUp<TSettings>, Action<TSettings>>;

/**
 * Event information received from Stream Deck when the property inspector appears.
 */
export type PropertyInspectorDidAppearEvent<TSettings extends JsonObject = JsonObject> = ActionWithoutPayloadEvent<PropertyInspectorDidAppear, Action<TSettings>>;

/**
 * Event information received from Stream Deck when the property inspector disappears.
 */
export type PropertyInspectorDidDisappearEvent<TSettings extends JsonObject = JsonObject> = ActionWithoutPayloadEvent<PropertyInspectorDidDisappear, Action<TSettings>>;

/**
 * Event information received from Stream Deck when the title, or title parameters, change.
 */
export type TitleParametersDidChangeEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<TitleParametersDidChange<TSettings>, Action<TSettings>>;

/**
 * Event information receives from Streak Deck when the system wakes from sleep.
 */
export type SystemDidWakeUpEvent = Event<SystemDidWakeUp>;

/**
 * Event information received from Stream Deck when the touchscreen is touched.
 */
export type TouchTapEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<TouchTap<TSettings>, Action<TSettings>>;

/**
 * Event information received from Stream Deck when an action appears on the canvas.
 */
export type WillAppearEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<WillAppear<TSettings>, Action<TSettings>>;

/**
 * Event information received from Stream Deck when an action disappears from the canvas.
 */
export type WillDisappearEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<WillDisappear<TSettings>, Action<TSettings>>;
