import { Action } from "./actions/action";
import type { StreamDeckClient } from "./client";
import * as events from "./connectivity/events";
import { Device } from "./devices";

/**
 * Provides information for events received from Stream Deck.
 */
export class Event<T extends events.Event> {
	/**
	 * Event that occurred.
	 */
	public readonly type: T["event"];

	/**
	 * Initializes a new instance of the {@link Event} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(source: T) {
		this.type = source.event;
	}
}

/**
 * Provides information for events relating to actions.
 */
export class ActionWithoutPayloadEvent<T extends Extract<events.Event, events.ActionIdentifier & events.DeviceIdentifier>> extends Event<T> {
	/**
	 * The action that raised the event.
	 */
	public readonly action: Action;

	/**
	 * Device identifier the action is associated with.
	 */
	public readonly deviceId: string;

	/**
	 * Initializes a new instance of the {@link ActionWithoutPayloadEvent} class.
	 * @param client The Stream Deck client that raised the event.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(client: StreamDeckClient, source: T) {
		super(source);

		this.action = new Action(client, source.action, source.context);
		this.deviceId = source.device;
	}
}

/**
 * Provides information for events relating to actions.
 */
export class ActionEvent<T extends Extract<events.Event, events.ActionIdentifier & events.DeviceIdentifier> & PayloadEvent<T>> extends ActionWithoutPayloadEvent<T> {
	/**
	 * Provides additional information about the event that occurred, e.g. how many `ticks` the dial was rotated, the current `state` of the action, etc.
	 */
	public readonly payload: ExtractPayload<T>;

	/**
	 * Initializes a new instance of the {@link ActionEvent} class.
	 * @param client The Stream Deck client that raised the event.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(client: StreamDeckClient, source: T) {
		super(client, source);
		this.payload = source.payload;
	}
}

/**
 * Provides information for events relating to {@link events.applicationDidLaunch} and {@link events.applicationDidTerminate}.
 */
export class ApplicationEvent<T extends events.ApplicationDidLaunch | events.ApplicationDidTerminate> extends Event<T> {
	/**
	 * Monitored application that was launched/terminated.
	 */
	public readonly application: string;

	/**
	 * Initializes a new instance of the {@link ApplicationEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(source: T) {
		super(source);
		this.application = source.payload.application;
	}
}

/**
 * Provides information for events relating to {@link events.deviceDidConnect} and {@link events.deviceDidDisconnect}.
 */
export class DeviceEvent<T extends events.DeviceDidConnect | events.DeviceDidDisconnect, TDevice> extends Event<T> {
	/**
	 * Initializes a new instance of the {@link DeviceEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 * @param device Device that event is associated with.
	 */
	constructor(source: T, public readonly device: TDevice) {
		super(source);
	}
}

/**
 * Provides event information for {@link events.sendToPlugin}.
 */
export class SendToPluginEvent<TPayload extends object> extends Event<events.SendToPlugin<TPayload>> {
	/**
	 * The action that raised the event.
	 */
	public readonly action: Action;

	/**
	 * Payload sent from the property inspector.
	 */
	public payload: TPayload;

	/**
	 * Initializes a new instance of the {@link SendToPluginEvent} class.
	 * @param client The Stream Deck client that raised the event.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(client: StreamDeckClient, source: events.SendToPlugin<TPayload>) {
		super(source);
		this.action = new Action(client, source.action, source.context);
		this.payload = source.payload;
	}
}

/**
 * Provides event information for {@link events.didReceiveGlobalSettings}.
 */
export class DidReceiveGlobalSettingsEvent<TSettings> extends Event<events.DidReceiveGlobalSettings<TSettings>> {
	/**
	 * Settings associated with the event.
	 */
	public readonly settings: Partial<TSettings>;

	/**
	 * Initializes a new instance of the {@link DidReceiveGlobalSettingsEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(source: events.DidReceiveGlobalSettings<TSettings>) {
		super(source);
		this.settings = source.payload.settings;
	}
}

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
export type DialDownEvent<TSettings> = ActionEvent<events.DialDown<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link events.DialRotate} event.
 */
export type DialRotateEvent<TSettings> = ActionEvent<events.DialRotate<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link events.DialUp} event.
 */
export type DialUpEvent<TSettings> = ActionEvent<events.DialUp<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link events.DidReceiveSettings} event.
 */
export type DidReceiveSettingsEvent<TSettings> = ActionEvent<events.DidReceiveSettings<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link events.KeyDown} event.
 */
export type KeyDownEvent<TSettings> = ActionEvent<events.KeyDown<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link events.KeyUp} event.
 */
export type KeyUpEvent<TSettings> = ActionEvent<events.KeyUp<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link events.PropertyInspectorDidAppear} event.
 */
export type PropertyInspectorDidAppearEvent = ActionWithoutPayloadEvent<events.PropertyInspectorDidAppear>;

/**
 * Event information received from Stream Deck as part of the {@link events.PropertyInspectorDidDisappear} event.
 */
export type PropertyInspectorDidDisappearEvent = ActionWithoutPayloadEvent<events.PropertyInspectorDidDisappear>;

/**
 * Event information received from Stream Deck as part of the {@link events.TitleParametersDidChange} event.
 */
export type TitleParametersDidChangeEvent<TSettings> = ActionEvent<events.TitleParametersDidChange<TSettings>>;

/**
 * Event information receives from Streak Deck as part of the {@link events.SystemDidWakeUp} event.
 */
export type SystemDidWakeUpEvent = Event<events.SystemDidWakeUp>;

/**
 * Event information received from Stream Deck as part of the {@link events.TouchTap} event.
 */
export type TouchTapEvent<TSettings> = ActionEvent<events.TouchTap<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link events.WillAppear} event.
 */
export type WillAppearEvent<TSettings> = ActionEvent<events.WillAppear<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link events.WillDisappear} event.
 */
export type WillDisappearEvent<TSettings> = ActionEvent<events.WillDisappear<TSettings>>;

/**
 * Utility type for extracting the payload type from the specified `T` type.
 */
type ExtractPayload<T> = T extends {
	/**
	 * Payload supplied with the event.
	 */
	payload: infer TPayload;
}
	? TPayload extends object
		? TPayload
		: never
	: never;

/**
 * Utility type for determining the payload of an event.
 */
type PayloadEvent<T> = {
	/**
	 * Payload providing additional information for an event.
	 */
	payload: ExtractPayload<T>;
};
