import { Action } from "./actions";
import * as messages from "./connectivity/messages";
import { StreamDeckClient } from "./definitions/client";

/**
 * Provides information for an event received from Stream Deck.
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
 * Provides information for an event that was associated with an action, that did not contain a payload.
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
 * Provides information for an event that was associated with an action.
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
 * Provides information for an event associated with a monitor application, i.e. when it launches, it terminates.
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
 * Provides information for an event associated with a device.
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
 * Provides information for an event that was associated with a payload message received from the property inspector.
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
 * Provides information for an event trigger when receiving the global settings.
 */
export class SettingsEvent<TSettings = unknown> extends Event<messages.DidReceiveGlobalSettings<TSettings>> {
	/**
	 * Settings associated with the event.
	 */
	public readonly settings: Partial<TSettings>;

	/**
	 * Initializes a new instance of the {@link SettingsEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(source: messages.DidReceiveGlobalSettings<TSettings>) {
		super(source);
		this.settings = source.payload.settings;
	}
}

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
