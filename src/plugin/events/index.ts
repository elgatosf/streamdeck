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
	PayloadObject,
	PropertyInspectorDidAppear,
	PropertyInspectorDidDisappear,
	SystemDidWakeUp,
	TitleParametersDidChange,
	TouchTap,
	WillAppear,
	WillDisappear
} from "../../api";
import type { Device } from "../devices";
import { ActionEvent, ActionWithoutPayloadEvent } from "./action-event";
import { ApplicationEvent } from "./application-event";
import { DeviceEvent } from "./device-event";
import { Event } from "./event";

export { DidReceiveDeepLinkEvent } from "./deep-link-event";
export { SendToPluginEvent } from "./send-to-plugin-event";
export { DidReceiveGlobalSettingsEvent } from "./settings-event";
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
export type DialDownEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<DialDown<TSettings>>;

/**
 * Event information received from Stream Deck when a dial is rotated.
 */
export type DialRotateEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<DialRotate<TSettings>>;

/**
 * Event information received from Stream Deck when a pressed dial is released.
 */
export type DialUpEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<DialUp<TSettings>>;

/**
 * Event information received from Stream Deck when the plugin receives settings.
 */
export type DidReceiveSettingsEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<DidReceiveSettings<TSettings>>;

/**
 * Event information received from Stream Deck when a key is pressed down.
 */
export type KeyDownEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<KeyDown<TSettings>>;

/**
 * Event information received from Stream Deck when a pressed key is release.
 */
export type KeyUpEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<KeyUp<TSettings>>;

/**
 * Event information received from Stream Deck when the property inspector appears.
 */
export type PropertyInspectorDidAppearEvent<TSettings extends PayloadObject<TSettings>> = ActionWithoutPayloadEvent<PropertyInspectorDidAppear, TSettings>;

/**
 * Event information received from Stream Deck when the property inspector disappears.
 */
export type PropertyInspectorDidDisappearEvent<TSettings extends PayloadObject<TSettings>> = ActionWithoutPayloadEvent<PropertyInspectorDidDisappear, TSettings>;

/**
 * Event information received from Stream Deck when the title, or title parameters, change.
 */
export type TitleParametersDidChangeEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<TitleParametersDidChange<TSettings>>;

/**
 * Event information receives from Streak Deck when the system wakes from sleep.
 */
export type SystemDidWakeUpEvent = Event<SystemDidWakeUp>;

/**
 * Event information received from Stream Deck when the touchscreen is touched.
 */
export type TouchTapEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<TouchTap<TSettings>>;

/**
 * Event information received from Stream Deck when an action appears on the canvas.
 */
export type WillAppearEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<WillAppear<TSettings>>;

/**
 * Event information received from Stream Deck when an action disappears from the canvas.
 */
export type WillDisappearEvent<TSettings extends PayloadObject<TSettings>> = ActionEvent<WillDisappear<TSettings>>;
