import type {
	ApplicationDidLaunch,
	ApplicationDidTerminate,
	DeviceDidChange,
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
	WillDisappear,
} from "../../api";
import { type ActionEvent, ActionWithoutPayloadEvent, Event } from "../../common/events";
import type { JsonObject } from "../../common/json";
import type { ActionContext } from "../actions/context";
import type { DialAction } from "../actions/dial";
import type { KeyAction } from "../actions/key";
import type { Device } from "../devices";
import { ApplicationEvent } from "./application-event";
import { DeviceEvent } from "./device-event";

export { DidReceiveGlobalSettingsEvent } from "../../common/events";
export { DidReceiveDeepLinkEvent } from "./deep-link-event";
export { SendToPluginEvent } from "./ui-message-event";
export { ApplicationEvent, DeviceEvent, Event };

/**
 * Event information received from Stream Deck when a monitored application launches.
 */
export type ApplicationDidLaunchEvent = ApplicationEvent<ApplicationDidLaunch>;

/**
 * Event information received from Stream Deck when a monitored application terminates.
 */
export type ApplicationDidTerminateEvent = ApplicationEvent<ApplicationDidTerminate>;

/**
 * Event information received from Stream Deck when a Stream Deck device changed.
 */
export type DeviceDidChangeEvent = DeviceEvent<DeviceDidChange, Required<Device>>;

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
export type DialDownEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<
	DialDown<TSettings>,
	DialAction<TSettings>
>;

/**
 * Event information received from Stream Deck when a dial is rotated.
 */
export type DialRotateEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<
	DialRotate<TSettings>,
	DialAction<TSettings>
>;

/**
 * Event information received from Stream Deck when a pressed dial is released.
 */
export type DialUpEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<
	DialUp<TSettings>,
	DialAction<TSettings>
>;

/**
 * Event information received from Stream Deck when the plugin receives settings.
 */
export type DidReceiveSettingsEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<
	DidReceiveSettings<TSettings>,
	DialAction<TSettings> | KeyAction<TSettings>
>;

/**
 * Event information received from Stream Deck when a key is pressed down.
 */
export type KeyDownEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<
	KeyDown<TSettings>,
	KeyAction<TSettings>
>;

/**
 * Event information received from Stream Deck when a pressed key is release.
 */
export type KeyUpEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<KeyUp<TSettings>, KeyAction<TSettings>>;

/**
 * Event information received from Stream Deck when the property inspector appears.
 */
export type PropertyInspectorDidAppearEvent<TSettings extends JsonObject = JsonObject> = ActionWithoutPayloadEvent<
	PropertyInspectorDidAppear,
	DialAction<TSettings> | KeyAction<TSettings>
>;

/**
 * Event information received from Stream Deck when the property inspector disappears.
 */
export type PropertyInspectorDidDisappearEvent<TSettings extends JsonObject = JsonObject> = ActionWithoutPayloadEvent<
	PropertyInspectorDidDisappear,
	DialAction<TSettings> | KeyAction<TSettings>
>;

/**
 * Event information received from Stream Deck when the title, or title parameters, change.
 */
export type TitleParametersDidChangeEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<
	TitleParametersDidChange<TSettings>,
	DialAction<TSettings> | KeyAction<TSettings>
>;

/**
 * Event information receives from Streak Deck when the system wakes from sleep.
 */
export type SystemDidWakeUpEvent = Event<SystemDidWakeUp>;

/**
 * Event information received from Stream Deck when the touchscreen is touched.
 */
export type TouchTapEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<
	TouchTap<TSettings>,
	DialAction<TSettings>
>;

/**
 * Event information received from Stream Deck when an action appears on the canvas.
 */
export type WillAppearEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<
	WillAppear<TSettings>,
	DialAction<TSettings> | KeyAction<TSettings>
>;

/**
 * Event information received from Stream Deck when an action disappears from the canvas.
 */
export type WillDisappearEvent<TSettings extends JsonObject = JsonObject> = ActionEvent<
	WillDisappear<TSettings>,
	ActionContext
>;
