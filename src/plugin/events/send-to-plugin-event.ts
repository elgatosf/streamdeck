import type { PayloadObject, SendToPlugin } from "../../api";
import { Event } from "../../common/events";
import type { Action } from "../actions/action";

/**
 * Provides information for an event trigger by a message being sent to the plugin, from the property inspector.
 */
export class SendToPluginEvent<TPayload extends PayloadObject<TPayload>, TSettings extends PayloadObject<TSettings>> extends Event<SendToPlugin<TPayload>> {
	/**
	 * Payload sent from the property inspector.
	 */
	public payload: TPayload;

	/**
	 * Initializes a new instance of the {@link SendToPluginEvent} class.
	 * @param action Action that raised the event.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(
		public readonly action: Action<TSettings>,
		source: SendToPlugin<TPayload>
	) {
		super(source);
		this.payload = source.payload;
	}
}
