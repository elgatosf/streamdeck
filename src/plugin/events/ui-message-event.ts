import type { DidReceivePropertyInspectorMessage } from "../../api";
import { Event } from "../../common/events";
import type { JsonObject, JsonValue } from "../../common/json";
import type { Action } from "../actions/action";

/**
 * Provides information for an event triggered by a message being sent to the plugin, from the property inspector.
 */
export class DidReceivePropertyInspectorMessageEvent<TPayload extends JsonValue, TSettings extends JsonObject> extends Event<DidReceivePropertyInspectorMessage<TPayload>> {
	/**
	 * Payload sent from the property inspector.
	 */
	public payload: TPayload;

	/**
	 * Initializes a new instance of the {@link DidReceivePropertyInspectorMessageEvent} class.
	 * @param action Action that raised the event.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(
		public readonly action: Action<TSettings>,
		source: DidReceivePropertyInspectorMessage<TPayload>
	) {
		super(source);
		this.payload = source.payload;
	}
}
