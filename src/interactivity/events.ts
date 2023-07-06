import * as messages from "../connectivity/messages";
import { Device } from "../devices";
import { Action } from "./action";
import { StreamDeckClient } from "./types/client";

/**
 * Provides information for events received from Stream Deck.
 */
export class Event<TMessage extends messages.Message<unknown>> {
	/**
	 * Event that occurred.
	 */
	public readonly type: TMessage["event"];

	/**
	 * Initializes a new instance of the {@link Event} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(source: TMessage) {
		this.type = source.event;
	}
}

/**
 * Provides information for events relating to actions.
 */
export class ActionWithoutPayloadEvent<TMessage extends messages.ActionMessage<unknown>> extends Event<TMessage> {
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
	constructor(client: StreamDeckClient, source: TMessage) {
		super(source);

		this.action = new Action(client, source.action, source.context);
		this.deviceId = source.device;
	}
}

/**
 * Provides information for events relating to actions.
 */
export class ActionEvent<TMessage extends messages.ActionMessageWithPayload<unknown, unknown, ExtractPayload<TMessage>>> extends ActionWithoutPayloadEvent<TMessage> {
	/**
	 * Provides additional information about the event that occurred, e.g. how many `ticks` the dial was rotated, the current `state` of the action, etc.
	 */
	public readonly payload: ExtractPayload<TMessage>;

	/**
	 * Initializes a new instance of the {@link ActionEvent} class.
	 * @param client The Stream Deck client that raised the event.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(client: StreamDeckClient, source: TMessage) {
		super(client, source);
		this.payload = source.payload;
	}
}

/**
 * Provides information for events relating to {@link messages.applicationDidLaunch} and {@link messages.applicationDidTerminate}.
 */
export class ApplicationEvent<TMessage extends messages.ApplicationDidLaunch | messages.ApplicationDidTerminate> extends Event<TMessage> {
	/**
	 * Monitored application that was launched/terminated.
	 */
	public readonly application: string;

	/**
	 * Initializes a new instance of the {@link ApplicationEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(source: TMessage) {
		super(source);
		this.application = source.payload.application;
	}
}

/**
 * Provides information for events relating to {@link messages.deviceDidConnect} and {@link messages.deviceDidDisconnect}.
 */
export class DeviceEvent<TMessage extends messages.DeviceDidConnect | messages.DeviceDidDisconnect, TDevice> extends Event<TMessage> {
	/**
	 * Initializes a new instance of the {@link DeviceEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 * @param device Device that event is associated with.
	 */
	constructor(source: TMessage, public readonly device: TDevice) {
		super(source);
	}
}

/**
 * Provides event information for {@link messages.sendToPlugin}.
 */
export class SendToPluginEvent<TPayload extends object> extends Event<messages.SendToPlugin<TPayload>> {
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
	constructor(client: StreamDeckClient, source: messages.SendToPlugin<TPayload>) {
		super(source);
		this.action = new Action(client, source.action, source.context);
		this.payload = source.payload;
	}
}

/**
 * Provides event information for {@link messages.didReceiveGlobalSettings}.
 */
export class DidReceiveGlobalSettingsEvent<TSettings> extends Event<messages.DidReceiveGlobalSettings<TSettings>> {
	/**
	 * Settings associated with the event.
	 */
	public readonly settings: Partial<TSettings>;

	/**
	 * Initializes a new instance of the {@link DidReceiveGlobalSettingsEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(source: messages.DidReceiveGlobalSettings<TSettings>) {
		super(source);
		this.settings = source.payload.settings;
	}
}

/**
 * Event information received from Stream Deck as part of the {@link messages.applicationDidLaunch} event.
 */
export type ApplicationDidLaunchEvent = ApplicationEvent<messages.ApplicationDidLaunch>;

/**
 * Event information received from Stream Deck as part of the {@link messages.ApplicationDidTerminate} event.
 */
export type ApplicationDidTerminateEvent = ApplicationEvent<messages.ApplicationDidTerminate>;

/**
 * Event information received from Stream Deck as part of the {@link messages.DeviceDidConnect} event.
 */
export type DeviceDidConnectEvent = DeviceEvent<messages.DeviceDidConnect, Required<Device>>;

/**
 * Event information received from Stream Deck as part of the {@link messages.DeviceDidDisconnect} event.
 */
export type DeviceDidDisconnectEvent = DeviceEvent<messages.DeviceDidDisconnect, Device>;

/**
 * Event information received from Stream Deck as part of the {@link messages.DialDown} event.
 */
export type DialDownEvent<TSettings> = ActionEvent<messages.DialDown<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link messages.DialRotate} event.
 */
export type DialRotateEvent<TSettings> = ActionEvent<messages.DialRotate<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link messages.DialUp} event.
 */
export type DialUpEvent<TSettings> = ActionEvent<messages.DialUp<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link messages.DidReceiveSettings} event.
 */
export type DidReceiveSettingsEvent<TSettings> = ActionEvent<messages.DidReceiveSettings<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link messages.KeyDown} event.
 */
export type KeyDownEvent<TSettings> = ActionEvent<messages.KeyDown<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link messages.KeyUp} event.
 */
export type KeyUpEvent<TSettings> = ActionEvent<messages.KeyUp<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link messages.PropertyInspectorDidAppear} event.
 */
export type PropertyInspectorDidAppearEvent = ActionWithoutPayloadEvent<messages.PropertyInspectorDidAppear>;

/**
 * Event information received from Stream Deck as part of the {@link messages.PropertyInspectorDidDisappear} event.
 */
export type PropertyInspectorDidDisappearEvent = ActionWithoutPayloadEvent<messages.PropertyInspectorDidDisappear>;

/**
 * Event information received from Stream Deck as part of the {@link messages.TitleParametersDidChange} event.
 */
export type TitleParametersDidChangeEvent<TSettings> = ActionEvent<messages.TitleParametersDidChange<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link messages.TouchTap} event.
 */
export type TouchTapEvent<TSettings> = ActionEvent<messages.TouchTap<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link messages.WillAppear} event.
 */
export type WillAppearEvent<TSettings> = ActionEvent<messages.WillAppear<TSettings>>;

/**
 * Event information received from Stream Deck as part of the {@link messages.WillDisappear} event.
 */
export type WillDisappearEvent<TSettings> = ActionEvent<messages.WillDisappear<TSettings>>;

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
