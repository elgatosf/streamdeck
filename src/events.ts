import * as messages from "./connectivity/messages";
import { ActionController, ContextualizedActionController } from "./controllers";

/**
 * An action associated with an event raised by Stream Deck.
 */
class ActionEventSource extends ContextualizedActionController {
	/**
	 * Initializes a new instance of the `ActionEventSource` class.
	 * @param controller Controller capable of updating the action.
	 * @param manifestId Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`).
	 * @param context Unique identifier of the instance of the action; this can be used to update the action on the Stream Deck, e.g. its title, settings, etc.
	 */
	constructor(controller: ActionController, public readonly manifestId: string, public readonly context: string) {
		super(controller, context);
	}
}

/**
 * Provides information for an event received from Stream Deck.
 */
export class Event<TMessage extends messages.Message<unknown>> {
	/**
	 * Event that occurred.
	 */
	public readonly type: TMessage["event"];

	/**
	 * Initializes a new instance of the `Event<T>` class.
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
	public readonly action: ActionEventSource;

	/**
	 * Device identifier the action is associated with.
	 */
	public readonly deviceId: string;

	/**
	 * Initializes a new instance of the `ActionWithoutPayloadEvent<T>` class.
	 * @param controller Controller capable of updating the action.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(controller: ActionController, source: TMessage) {
		super(source);

		this.action = new ActionEventSource(controller, source.action, source.context);
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
	 * Initializes a new instance of the `ActionEvent<T>` class.
	 * @param controller Controller capable of updating the action.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(controller: ActionController, source: TMessage) {
		super(controller, source);
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
	 * Initializes a new instance of the `ApplicationEvent<T>` class.
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
	 * Initializes a new instance of the `DeviceEvent<T>` class.
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
	public readonly action: ActionEventSource;

	/**
	 * Payload sent from the property inspector.
	 */
	public payload: TPayload;

	/**
	 * Initializes a new instance of the `PropertyInspectorMessageEvent<TPayload>` class.
	 * @param controller Controller capable of updating the action.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(controller: ActionController, source: messages.SendToPlugin<TPayload>) {
		super(source);
		this.action = new ActionEventSource(controller, source.action, source.context);
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
	 * Initializes a new instance of the `SettingsEvent<TSettings>` class.
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
