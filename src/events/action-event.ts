import { Action } from "../actions/action";
import type { StreamDeckClient } from "../client";
import * as events from "../connectivity/events";
import { Event } from "./event";

/**
 * Provides information for an event relating to an action.
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
 * Provides information for an event relating to an action.
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
