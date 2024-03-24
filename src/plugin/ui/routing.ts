import type { MessageRequest as ScopedMessageRequest } from ".";
import type { ActionIdentifier, DeviceIdentifier } from "../../api";
import type { JsonObject, JsonValue } from "../../common/json";
import { MessageGateway, type MessageHandler, type MessageRequestOptions, type MessageResponder, type MessageResponse } from "../../common/messaging";
import { Action } from "../actions/action";
import { ActionContext } from "../actions/context";
import type { SingletonAction } from "../actions/singleton-action";
import { connection } from "../connection";

let currentUI: PropertyInspector | undefined;

/**
 * Router responsible for communicating with the property inspector.
 */
const router = new MessageGateway<Action>(
	async (payload: JsonValue) => {
		if (currentUI) {
			await currentUI.sendMessage(payload);
			return true;
		}

		return false;
	},
	(source) => new Action(source)
);

connection.on("propertyInspectorDidAppear", (ev) => (currentUI = new PropertyInspector(ev)));
connection.on("propertyInspectorDidDisappear", () => (currentUI = undefined));
connection.on("sendToPlugin", (ev) => router.process(ev));

export { router };

/**
 * Register the function as a request route. Fetch requests from the property inspector to the specified path will be routed to the function when sent from a property inspector
 * associated with this action type.
 * @param path Path of the request.
 * @returns The decorator factory.
 */
export function route<TBody extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject, TResult extends ReturnType<MessageHandler<Action, TBody>> = undefined>(
	path: string
): (target: MessageHandler<Action<TSettings>, TBody>, context: ClassMethodDecoratorContext<SingletonAction>) => RoutedMessageHandler<TBody, TSettings, TResult> | void {
	return function (target: MessageHandler<Action<TSettings>, TBody>, context: ClassMethodDecoratorContext<SingletonAction>): void {
		context.addInitializer(function () {
			router.route(path, target.bind(this), {
				filter: (req) => req.action.manifestId === this.manifestId
			});
		});
	};
}

/**
 * Wraps {@link MessageHandler} to provide scoped request, with a dynamic return type.
 * @param request Request received from the property inspector.
 * @param responder Responder responsible for responding to the request.
 * @template TBody Body type sent with the request.
 * @template TSettings Settings type associated with the action.
 * @template TResult Result type of the request handler.
 */
type RoutedMessageHandler<TBody extends JsonValue, TSettings extends JsonObject, TResult> = (
	request?: ScopedMessageRequest<TBody, TSettings>,
	responder?: MessageResponder
) => TResult;

/**
 * Gets the current property inspector.
 * @returns The property inspector; otherwise `undefined`.
 */
export function getCurrentUI(): PropertyInspector | undefined {
	return currentUI;
}

/**
 * Property inspector providing information about its context, and functions for sending and fetching messages.
 */
export class PropertyInspector extends ActionContext implements Pick<MessageGateway<Action>, "fetch"> {
	/**
	 * Unique identifier of the Stream Deck device this property inspector is associated with.
	 */
	public readonly deviceId: string;

	/**
	 * Initializes a new instance of the {@link PropertyInspector} class.
	 * @param source Source the property inspector is associated with.
	 */
	constructor(source: ActionIdentifier & DeviceIdentifier) {
		super(source);
		this.deviceId = source.device;
	}

	/**
	 * Sends a fetch request to the property inspector; the property inspector can listen for requests by registering routes.
	 * ```ts
	 * // Within the property inspector.
	 * streamDeck.plugin.registerRoute(path, handler, options)
	 * ```
	 * @param request The request.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(request: MessageRequestOptions): Promise<MessageResponse<T>>;
	/**
	 * Sends a fetch request to the property inspector; the property inspector can listen for requests by registering routes.
	 * ```ts
	 * // Within the property inspector.
	 * streamDeck.plugin.registerRoute(path, handler, options)
	 * ```
	 * @param path Path of the request.
	 * @param body Optional body sent with the request.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(path: string, body?: JsonValue): Promise<MessageResponse<T>>;
	/**
	 * Sends a fetch request to the property inspector; the property inspector can listen for requests by registering routes.
	 * ```ts
	 * // Within the property inspector.
	 * streamDeck.plugin.registerRoute(path, handler, options)
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
	 * Sends a message to the property inspector.
	 * @param payload Payload to send.
	 * @returns Promise completed when the message was sent.
	 */
	public sendMessage(payload: JsonValue): Promise<void> {
		return connection.send({
			event: "sendToPropertyInspector",
			context: this.id,
			payload
		});
	}
}
