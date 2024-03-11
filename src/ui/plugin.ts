import type { DidReceivePluginMessage, PayloadObject } from "../api";
import type { IDisposable } from "../common/disposable";
import { connection } from "./connection";
import type { DidReceivePluginMessageEvent } from "./events";
import { getSettings, setSettings } from "./settings";

/**
 * Occurs when a message was sent to the property inspector _from_ the plugin. The property inspector can also send messages _to_ the plugin using {@link sendToPlugin}.
 * @template TPayload The type of the payload received from the property inspector.
 * @template TSettings The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDidReceivePluginMessage<TPayload extends PayloadObject<TPayload> = object, TSettings extends PayloadObject<TSettings> = object>(
	listener: (ev: DidReceivePluginMessageEvent<TPayload, TSettings>) => void
): IDisposable {
	return connection.disposableOn("sendToPropertyInspector", (ev: DidReceivePluginMessage<TPayload>) =>
		listener({
			action: {
				id: ev.context,
				manifestId: ev.action,
				getSettings,
				setSettings
			},
			payload: ev.payload,
			type: ev.event
		})
	);
}

/**
 * Sends the {@link payload} to the plugin. The property inspector can also receive information from the plugin via {@link onDidReceivePluginMessage} allowing for bi-directional
 * communication.
 * @template T The type of the payload received from the property inspector.
 * @param payload Payload to send to the property inspector.
 * @returns `Promise` resolved when {@link payload} has been sent to the property inspector.
 */
export async function sendToPlugin<T extends PayloadObject<T> = object>(payload: T): Promise<void> {
	const {
		uuid,
		actionInfo: { action }
	} = await connection.getInfo();

	return connection.send({
		event: "sendToPlugin",
		action,
		context: uuid,
		payload
	});
}
