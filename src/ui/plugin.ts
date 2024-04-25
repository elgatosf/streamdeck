import type { IDisposable } from "../common/disposable";
import type { JsonObject, JsonValue } from "../common/json";
import {
	MessageGateway,
	PUBLIC_PATH_PREFIX,
	type MessageRequestOptions,
	type MessageResponder,
	type MessageResponse,
	type RouteConfiguration,
	type UnscopedMessageHandler,
	type UnscopedMessageRequest
} from "../common/messaging";
import type streamDeck from "./";
import type { Action } from "./action";
import { connection } from "./connection";
import type { SendToPropertyInspectorEvent } from "./events";
import { getSettings, setSettings } from "./settings";

/**
 * Router responsible for communicating with the plugin.
 */
const router = new MessageGateway<Action>(
	async (payload: JsonValue) => {
		await sendPayload(payload);
		return true;
	},
	({ context: id, action: manifestId }) => ({ id, manifestId, getSettings, setSettings }) satisfies Action
);

connection.on("sendToPropertyInspector", (ev) => router.process(ev));

/**
 * Controller responsible for interacting with the plugin associated with the property inspector.
 */
class PluginController {
	/**
	 * Sends a fetch request to the plugin; the plugin can listen for requests by registering routes.
	 * @template T The type of the response body.
	 * @param request The request to send to the plugin.
	 * @returns The response.
	 * @example
	 * // Within the plugin, setup the route.
	 * streamDeck.ui.registerRoute("/get-names", () => {
	 *   return ["Mario", "Luigi", "Peach"];
	 * });
	 *
	 * // Within the property inspector, send a fetch request to the plugin.
	 * const res = await streamDeck.plugin.fetch({
	 *   path: "/get-names"
	 * });
	 *
	 * // res.body = ["Mario", "Luigi", "Peach"]
	 */
	public async fetch<T extends JsonValue = JsonValue>(request: MessageRequestOptions): Promise<MessageResponse<T>>;
	/**
	 * Sends a fetch request to the plugin; the plugin can listen for requests by registering routes.
	 * @template T The type of the response body.
	 * @param path Path of the request being sent to the plugin.
	 * @param body Optional body sent with the request.
	 * @example
	 * // Within the plugin, setup the route.
	 * streamDeck.ui.registerRoute("/get-names", () => {
	 *   return ["Mario", "Luigi", "Peach"];
	 * });
	 *
	 * // Within the property inspector, send a fetch request to the plugin.
	 * const res = await streamDeck.plugin.fetch({
	 *   path: "/get-names"
	 * });
	 *
	 * // res.body = ["Mario", "Luigi", "Peach"]
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(path: string, body?: JsonValue): Promise<MessageResponse<T>>;
	/**
	 * Sends a fetch request to the plugin; the plugin can listen for requests by registering routes.
	 * @template T The type of the response body.
	 * @param requestOrPath The request, or the path of the request.
	 * @param bodyOrUndefined Request body, or moot when constructing the request with {@link MessageRequestOptions}.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(requestOrPath: MessageRequestOptions | string, bodyOrUndefined?: JsonValue): Promise<MessageResponse<T>> {
		if (typeof requestOrPath === "string") {
			return router.fetch(`${PUBLIC_PATH_PREFIX}${requestOrPath}`, bodyOrUndefined);
		} else {
			return router.fetch({
				...requestOrPath,
				path: `${PUBLIC_PATH_PREFIX}${requestOrPath.path}`
			});
		}
	}

	/**
	 * Occurs when a message was sent to the property inspector _from_ the plugin. The property inspector can also send messages _to_ the plugin using {@link PluginController.sendToPlugin}.
	 * @deprecated Consider using {@link streamDeck.plugin.registerRoute} to receive requests from the plugin.
	 * @template TPayload The type of the payload received from the property inspector.
	 * @template TSettings The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onSendToPropertyInspector<TPayload extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject>(
		listener: (ev: SendToPropertyInspectorEvent<TPayload, TSettings>) => void
	): IDisposable {
		return router.disposableOn("unhandledMessage", (ev) => {
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
	 * Registers the function as a route, exposing it to the plugin via `streamDeck.ui.current.fetch(path)`.
	 * @template TBody The type of the request body.
	 * @template TSettings The type of the action's settings.
	 * @param path Path that identifies the route.
	 * @param handler Handler to be invoked when a matching request is received.
	 * @param options Optional routing configuration.
	 * @returns Disposable capable of removing the route handler.
	 * @example
	 * streamDeck.plugin.registerRoute("/set-text", async (req, res) => {
	 *   // Set the value of the text field in the property inspector.
	 *   document.querySelector("#text-field").value = req.body.value;
	 * });
	 */
	public registerRoute<TBody extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject>(
		path: string,
		handler: MessageHandler<TBody, TSettings>,
		options?: RouteConfiguration<Action>
	): IDisposable {
		return router.route(`${PUBLIC_PATH_PREFIX}${path}`, handler, options);
	}

	/**
	 * Sends a payload to the plugin.
	 * @deprecated Consider using {@link streamDeck.plugin.fetch} to send requests to the plugin.
	 * @param payload Payload to send.
	 * @returns Promise completed when the message was sent.
	 */
	public async sendToPlugin(payload: JsonValue): Promise<void> {
		return sendPayload(payload);
	}
}

/**
 * Sends a payload to the plugin.
 * @param payload Payload to send.
 * @returns Promise completed when the message was sent.
 */
async function sendPayload(payload: JsonValue): Promise<void> {
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

export const plugin = new PluginController();
export { router, type PluginController };

/**
 * Message request received from the plugin.
 * @template TBody The type of the request body.
 * @template TSettings The type of the action's settings.
 */
export type MessageRequest<TBody extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject> = UnscopedMessageRequest<Action<TSettings>, TBody>;

/**
 * Function responsible for handling requests received from the plugin.
 * @param request Request received from the plugin
 * @param responder Optional responder capable of sending a response; when no response is sent, a `200` is returned.
 * @template TBody The type of the request body.
 * @template TSettings The type of the action's settings.
 */
export type MessageHandler<TBody extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject> = (
	request: MessageRequest<TBody, TSettings>,
	responder: MessageResponder
) => ReturnType<UnscopedMessageHandler<Action<TSettings>, TBody>>;
