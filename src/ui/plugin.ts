import type { JsonObject, JsonValue } from ".";
import type { IDisposable } from "../common/disposable";
import { MessageGateway, type MessageHandler, type MessageRequestOptions, type MessageResponse, type RouteConfiguration } from "../common/messaging";
import type { Action } from "./action";
import { connection } from "./connection";
import type { DidReceivePluginMessageEvent } from "./events";
import { getSettings, setSettings } from "./settings";

/**
 * The gateway responsible for communicating with the plugin, sending and receiving requests and responses.
 */
const gateway = new MessageGateway<Action>(
	async (payload: JsonValue) => {
		await sendToPlugin(payload);
		return true;
	},
	({ context: id, action: manifestId }) => ({ id, manifestId, getSettings, setSettings }) satisfies Action
);

connection.on("sendToPropertyInspector", (ev) => gateway.process(ev));

/**
 * Sends the {@link request} to the plugin; the plugin can listen to requests using `streamDeck.ui.route(string, handler, options)`.
 * @param request The request.
 * @returns The response.
 */
export function fetch<T extends JsonValue = JsonValue>(request: MessageRequestOptions): Promise<MessageResponse<T>>;
/**
 * Sends the request to the plugin; the plugin can listen to requests using `streamDeck.ui.route(string, handler, options)`.
 * @param path Path of the request.
 * @param body Optional body sent with the request.
 * @returns The response.
 */
export function fetch<T extends JsonValue = JsonValue>(path: string, body?: JsonValue): Promise<MessageResponse<T>>;
/**
 * Sends the {@link requestOrPath} to the plugin; the plugin can listen to requests using `streamDeck.ui.route(string, handler, options)`.
 * @param requestOrPath The request, or the path of the request.
 * @param bodyOrUndefined Request body, or moot when constructing the request with {@link MessageRequestOptions}.
 * @returns The response.
 */
export function fetch<T extends JsonValue = JsonValue>(requestOrPath: MessageRequestOptions | string, bodyOrUndefined?: JsonValue): Promise<MessageResponse<T>> {
	return typeof requestOrPath === "string" ? gateway.fetch(requestOrPath, bodyOrUndefined) : gateway.fetch(requestOrPath);
}

/**
 * Occurs when a message was sent to the property inspector _from_ the plugin. The property inspector can also send messages _to_ the plugin using {@link sendToPlugin}.
 * @template TPayload The type of the payload received from the property inspector.
 * @template TSettings The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDidReceivePluginMessage<TPayload extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject>(
	listener: (ev: DidReceivePluginMessageEvent<TPayload, TSettings>) => void
): IDisposable {
	return gateway.disposableOn("unhandledMessage", (ev) => {
		listener({
			action: {
				id: ev.context,
				manifestId: ev.action,
				getSettings,
				setSettings
			},
			payload: ev.payload as TPayload,
			type: "sendToPropertyInspector"
		});
	});
}

/**
 * Maps the specified {@link path} to the {@link handler}, allowing for requests from the plugin.
 * @param path Path used to identify the route.
 * @param handler Handler to be invoked when the request is received.
 * @param options Optional routing configuration.
 */
export function route<TBody extends JsonValue = JsonValue>(path: string, handler: MessageHandler<Action, TBody>, options?: RouteConfiguration<Action>): void {
	gateway.route(path, handler, options);
}

/**
 * Sends the {@link payload} to the plugin. The property inspector can also receive information from the plugin via {@link onDidReceivePluginMessage} allowing for bi-directional
 * communication.
 * @template T The type of the payload received from the property inspector.
 * @param payload Payload to send to the property inspector.
 * @returns `Promise` resolved when {@link payload} has been sent to the property inspector.
 */
export async function sendToPlugin<T extends JsonValue = JsonValue>(payload: T): Promise<void> {
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
