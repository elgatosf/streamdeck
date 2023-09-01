import * as events from "../connectivity/events";
import { Device } from "../devices";
import { ActionEvent, ActionWithoutPayloadEvent } from "./action-event";
import { ApplicationEvent } from "./application-event";
import { DeviceEvent } from "./device-event";
import { Event } from "./event";

export { SendToPluginEvent } from "./send-to-plugin-event";
export { DidReceiveGlobalSettingsEvent } from "./settings-event";
export { ActionEvent, ActionWithoutPayloadEvent, ApplicationEvent, DeviceEvent, Event };

/**
 * Event information received from Stream Deck as part of the {@link events.applicationDidLaunch} event.
 */
export type ApplicationDidLaunchEvent = ApplicationEvent<events.ApplicationDidLaunch>;

/**
 * Event information received from Stream Deck as part of the {@link events.ApplicationDidTerminate} event.
 */
export type ApplicationDidTerminateEvent = ApplicationEvent<events.ApplicationDidTerminate>;

/**
 * Event information received from Stream Deck as part of the {@link events.DeviceDidConnect} event.
 */
export type DeviceDidConnectEvent = DeviceEvent<events.DeviceDidConnect, Required<Device>>;

/**
 * Event information received from Stream Deck as part of the {@link events.DeviceDidDisconnect} event.
 */
export type DeviceDidDisconnectEvent = DeviceEvent<events.DeviceDidDisconnect, Device>;

/**
 * Event information received from Stream Deck as part of the {@link events.DialDown} event.
 */
export type DialDownEvent<TSettings> = ActionEvent<events.DialDown<TSettings>, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link events.DialRotate} event.
 */
export type DialRotateEvent<TSettings> = ActionEvent<events.DialRotate<TSettings>, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link events.DialUp} event.
 */
export type DialUpEvent<TSettings> = ActionEvent<events.DialUp<TSettings>, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link events.DidReceiveSettings} event.
 */
export type DidReceiveSettingsEvent<TSettings> = ActionEvent<events.DidReceiveSettings<TSettings>, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link events.KeyDown} event.
 */
export type KeyDownEvent<TSettings> = ActionEvent<events.KeyDown<TSettings>, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link events.KeyUp} event.
 */
export type KeyUpEvent<TSettings> = ActionEvent<events.KeyUp<TSettings>, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link events.PropertyInspectorDidAppear} event.
 */
export type PropertyInspectorDidAppearEvent<TSettings> = ActionWithoutPayloadEvent<events.PropertyInspectorDidAppear, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link events.PropertyInspectorDidDisappear} event.
 */
export type PropertyInspectorDidDisappearEvent<TSettings> = ActionWithoutPayloadEvent<events.PropertyInspectorDidDisappear, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link events.TitleParametersDidChange} event.
 */
export type TitleParametersDidChangeEvent<TSettings> = ActionEvent<events.TitleParametersDidChange<TSettings>, TSettings>;

/**
 * Event information receives from Streak Deck as part of the {@link events.SystemDidWakeUp} event.
 */
export type SystemDidWakeUpEvent = Event<events.SystemDidWakeUp>;

/**
 * Event information received from Stream Deck as part of the {@link events.TouchTap} event.
 */
export type TouchTapEvent<TSettings> = ActionEvent<events.TouchTap<TSettings>, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link events.WillAppear} event.
 */
export type WillAppearEvent<TSettings> = ActionEvent<events.WillAppear<TSettings>, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link events.WillDisappear} event.
 */
export type WillDisappearEvent<TSettings> = ActionEvent<events.WillDisappear<TSettings>, TSettings>;
