import { StreamDeckConnection } from "../connectivity/connection";
import type * as api from "../connectivity/events";

/**
 * Gets the settings associated with an instance of an action, as identified by the {@link context}. An instance of an action represents a button, dial, pedal, etc.
 * @template T The type of settings associated with the action.
 * @param connection Connection with Stream Deck.
 * @param context Unique identifier of the action instance whose settings are being requested.
 * @returns Promise containing the action instance's settings.
 */
export function getSettings<T extends api.PayloadObject<T> = object>(connection: StreamDeckConnection, context: string): Promise<T> {
	return new Promise((resolve) => {
		const callback = (ev: api.DidReceiveSettings<T>): void => {
			if (ev.context == context) {
				resolve(ev.payload.settings);
				connection.removeListener("didReceiveSettings", callback);
			}
		};

		connection.on("didReceiveSettings", callback);
		connection.send({
			event: "getSettings",
			context
		});
	});
}
