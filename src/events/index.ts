import * as api from "../connectivity/events";
import { Device } from "../devices";
import { ActionEvent, ActionWithoutPayloadEvent } from "./action-event";
import { ApplicationEvent } from "./application-event";
import { DeviceEvent } from "./device-event";
import { Event } from "./event";

export { DidReceiveDeepLinkEvent } from "./deep-link-event";
export { SendToPluginEvent } from "./send-to-plugin-event";
export { DidReceiveGlobalSettingsEvent } from "./settings-event";
export { ActionEvent, ActionWithoutPayloadEvent, ApplicationEvent, DeviceEvent, Event };

/**
 * Event information received from Stream Deck as part of the {@link api.applicationDidLaunch} event.
 */
export type ApplicationDidLaunchEvent = ApplicationEvent<api.ApplicationDidLaunch>;

/**
 * Event information received from Stream Deck as part of the {@link api.ApplicationDidTerminate} event.
 */
export type ApplicationDidTerminateEvent = ApplicationEvent<api.ApplicationDidTerminate>;

/**
 * Event information received from Stream Deck as part of the {@link api.DeviceDidConnect} event.
 */
export type DeviceDidConnectEvent = DeviceEvent<api.DeviceDidConnect, Required<Device>>;

/**
 * Event information received from Stream Deck as part of the {@link api.DeviceDidDisconnect} event.
 */
export type DeviceDidDisconnectEvent = DeviceEvent<api.DeviceDidDisconnect, Device>;

/**
 * Event information received from Stream Deck as part of the {@link api.DialDown} event.
 */
export type DialDownEvent<TSettings extends api.PayloadObject<TSettings>> = ActionEvent<api.DialDown<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link api.DialRotate} event.
 */
export type DialRotateEvent<TSettings extends api.PayloadObject<TSettings>> = ActionEvent<api.DialRotate<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link api.DialUp} event.
 */
export type DialUpEvent<TSettings extends api.PayloadObject<TSettings>> = ActionEvent<api.DialUp<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link api.DidReceiveSettings} event.
 */
export type DidReceiveSettingsEvent<TSettings extends api.PayloadObject<TSettings>> = ActionEvent<api.DidReceiveSettings<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link api.KeyDown} event.
 */
export type KeyDownEvent<TSettings extends api.PayloadObject<TSettings>> = ActionEvent<api.KeyDown<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link api.KeyUp} event.
 */
export type KeyUpEvent<TSettings extends api.PayloadObject<TSettings>> = ActionEvent<api.KeyUp<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link api.PropertyInspectorDidAppear} event.
 */
export type PropertyInspectorDidAppearEvent<TSettings extends api.PayloadObject<TSettings>> = ActionWithoutPayloadEvent<api.PropertyInspectorDidAppear, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link api.PropertyInspectorDidDisappear} event.
 */
export type PropertyInspectorDidDisappearEvent<TSettings extends api.PayloadObject<TSettings>> = ActionWithoutPayloadEvent<api.PropertyInspectorDidDisappear, TSettings>;

/**
 * Event information received from Stream Deck as part of the {@link api.TitleParametersDidChange} event.
 */
export type TitleParametersDidChangeEvent<TSettings extends api.PayloadObject<TSettings>> = ActionEvent<api.TitleParametersDidChange<TSettings>>;

/**
 * Event information receives from Streak Deck as part of the {@link api.SystemDidWakeUp} event.
 */
export type SystemDidWakeUpEvent = Event<api.SystemDidWakeUp>;

/**
 * Event information received from Stream Deck as part of the {@link api.TouchTap} event.
 */
export type TouchTapEvent<TSettings extends api.PayloadObject<TSettings>> = ActionEvent<api.TouchTap<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link api.WillAppear} event.
 */
export type WillAppearEvent<TSettings extends api.PayloadObject<TSettings>> = ActionEvent<api.WillAppear<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link api.WillDisappear} event.
 */
export type WillDisappearEvent<TSettings extends api.PayloadObject<TSettings>> = ActionEvent<api.WillDisappear<TSettings>>;
