import type { JsonObject, JsonValue } from ".";
import type { IDisposable } from "../common/disposable";
import { MessageGateway, type MessageHandler, type MessageRequestOptions, type MessageResponse, type RouteConfiguration } from "../common/messaging";
import type { Action } from "./action";
import { connection } from "./connection";
import type { DidReceivePluginMessageEvent } from "./events";
import { getSettings, setSettings } from "./settings";

/**
 * Router responsible for communicating with the plugin.
 */
const router = new MessageGateway<Action>(
	async (payload: JsonValue) => {
		await plugin.sendMessage(payload);
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
	 * ```ts
	 * // Within the plugin.
	 * streamDeck.ui.registerRoute(path, handler, options)
	 * ```
	 * @param request The request.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(request: MessageRequestOptions): Promise<MessageResponse<T>>;
	/**
	 * Sends a fetch request to the plugin; the plugin can listen for requests by registering routes.
	 * ```ts
	 * // Within the plugin.
	 * streamDeck.ui.registerRoute(path, handler, options)
	 * ```
	 * @param path Path of the request.
	 * @param body Optional body sent with the request.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(path: string, body?: JsonValue): Promise<MessageResponse<T>>;
	/**
	 * Sends a fetch request to the plugin; the plugin can listen for requests by registering routes.
	 * ```ts
	 * // Within the plugin.
	 * streamDeck.ui.registerRoute(path, handler, options)
	 * ```
	 * @param requestOrPath The request, or the path of the request.
	 * @param bodyOrUndefined Request body, or moot when constructing the request with {@link MessageRequestOptions}.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(requestOrPath: MessageRequestOptions | string, bodyOrUndefined?: JsonValue): Promise<MessageResponse<T>> {
		if (typeof requestOrPath === "string") {
			return router.fetch(requestOrPath, bodyOrUndefined);
		} else {
			return router.fetch(requestOrPath);
		}
	}

	/**
	 * Occurs when a message was sent to the property inspector _from_ the plugin. The property inspector can also send messages _to_ the plugin using {@link PluginController.sendMessage}.
	 * @template TPayload The type of the payload received from the property inspector.
	 * @template TSettings The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onMessage<TPayload extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject>(
		listener: (ev: DidReceivePluginMessageEvent<TPayload, TSettings>) => void
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
	 * Creates a request route, mapping the path to the handler. The plugin can then send requests to the handler using `streamDeck.ui.fetch(path)`.
	 * @param path Path that identifies the route.
	 * @param handler Handler to be invoked when a matching request is received.
	 * @param options Optional routing configuration.
	 * @example
	 * streamDeck.plugin.onRequest("/populate-dropdowns", async (req, res) => {
	 *   // handler
	 * });
	 */
	public registerRoute<T extends JsonValue = JsonValue>(path: string, handler: MessageHandler<Action, T>, options?: RouteConfiguration<Action>): void {
		router.route(path, handler, options);
	}

	/**
	 * Sends a message to the plugin.
	 * @param payload Payload to send.
	 * @returns Promise completed when the message was sent.
	 */
	public async sendMessage(payload: JsonValue): Promise<void> {
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
}

export const plugin = new PluginController();
export { router, type PluginController };
