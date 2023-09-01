import { Action } from "../actions/action";
import type { StreamDeckClient } from "../client";
import { SendToPlugin } from "../connectivity/events";
import { Event } from "./event";

/**
 * Provides information for an event trigger by a message being sent to the plugin, from the property inspector.
 */
export class SendToPluginEvent<TPayload extends object, TSettings> extends Event<SendToPlugin<TPayload>> {
	/**
	 * The action that raised the event.
	 */
	public readonly action: Action<TSettings>;

	/**
	 * Payload sent from the property inspector.
	 */
	public payload: TPayload;

	/**
	 * Initializes a new instance of the {@link SendToPluginEvent} class.
	 * @param client The Stream Deck client that raised the event.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(client: StreamDeckClient, source: SendToPlugin<TPayload>) {
		super(source);
		this.action = new Action(client, source.action, source.context);
		this.payload = source.payload;
	}
}
