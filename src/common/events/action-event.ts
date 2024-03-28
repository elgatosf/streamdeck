import type { ActionIdentifier, DeviceIdentifier, PluginEvent } from "../../api";
import { Event } from "./event";

/**
 * Provides information for an event relating to an action.
 */
export class ActionWithoutPayloadEvent<TSource extends Extract<PluginEvent, ActionIdentifier & DeviceIdentifier>, TAction> extends Event<TSource> {
	/**
	 * Device identifier the action is associated with.
	 */
	public readonly deviceId: string;

	/**
	 * Initializes a new instance of the {@link ActionWithoutPayloadEvent} class.
	 * @param action Action that raised the event.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(
		public readonly action: TAction,
		source: TSource
	) {
		super(source);
		this.deviceId = source.device;
	}
}

/**
 * Provides information for an event relating to an action.
 */
export class ActionEvent<TSource extends Extract<PluginEvent, ActionIdentifier & DeviceIdentifier> & PayloadEvent<TSource>, TAction> extends ActionWithoutPayloadEvent<
	TSource,
	TAction
> {
	/**
	 * Provides additional information about the event that occurred, e.g. how many `ticks` the dial was rotated, the current `state` of the action, etc.
	 */
	public readonly payload: ExtractPayload<TSource>;

	/**
	 * Initializes a new instance of the {@link ActionEvent} class.
	 * @param action Action that raised the event.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(action: TAction, source: TSource) {
		super(action, source);
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
