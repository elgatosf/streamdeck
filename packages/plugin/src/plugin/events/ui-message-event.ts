import type { JsonObject, JsonValue } from "@elgato/utils";

import type { DidReceivePropertyInspectorMessage } from "../../api/index.js";
import type { Action } from "../actions/action.js";
import { Event } from "./event.js";

/**
 * Provides information for an event triggered by a message being sent to the plugin, from the property inspector.
 */
export class SendToPluginEvent<TPayload extends JsonValue, TSettings extends JsonObject> extends Event<
	DidReceivePropertyInspectorMessage<TPayload>
> {
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
		source: DidReceivePropertyInspectorMessage<TPayload>,
	) {
		super(source);
		this.payload = source.payload;
	}
}
