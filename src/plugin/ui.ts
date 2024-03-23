import type { DidReceivePropertyInspectorMessage, PropertyInspectorDidAppear, PropertyInspectorDidDisappear } from "../api";
import type { IDisposable } from "../common/disposable";
import { ActionWithoutPayloadEvent } from "../common/events";
import type { JsonObject, JsonValue } from "../common/json";
import { MessageGateway, type MessageHandler, type MessageRequestOptions, type MessageResponse, type RouteConfiguration } from "../common/messaging";
import { Action } from "./actions/action";
import { connection } from "./connection";
import { DidReceivePropertyInspectorMessageEvent, PropertyInspectorDidAppearEvent, PropertyInspectorDidDisappearEvent } from "./events";

let current: string | undefined;

/**
 * The gateway responsible for communicating with the property inspector, sending and receiving requests and responses.
 */
const gateway = new MessageGateway<Action>(
	async (payload: JsonValue) => {
		if (!current) {
			return false;
		}

		await connection.send({
			context: current,
			event: "sendToPropertyInspector",
			payload
		});

		return true;
	},
	(source) => new Action(source)
);

connection.on("propertyInspectorDidAppear", (ev) => (current = ev.context));
connection.on("propertyInspectorDidDisappear", () => (current = undefined));
connection.on("sendToPlugin", (ev) => gateway.process(ev));

/**
 * Sends a fetch request to the **property inspector**; the property inspector can map requests using `streamDeck.plugin.route(path, handler, options)`.
 * @param request The request.
 * @returns The response.
 */
export function fetch<T extends JsonValue = JsonValue>(request: MessageRequestOptions): Promise<MessageResponse<T>>;
/**
 * Sends a fetch request to the **property inspector**; the property inspector can map requests using `streamDeck.plugin.route(path, handler, options)`.
 * @param path Path of the request.
 * @param body Optional body sent with the request.
 * @returns The response.
 */
export function fetch<T extends JsonValue = JsonValue>(path: string, body?: JsonValue): Promise<MessageResponse<T>>;
/**
 * Sends a fetch request to the **property inspector**; the property inspector can map requests using `streamDeck.plugin.route(path, handler, options)`.
 * @param requestOrPath The request, or the path of the request.
 * @param bodyOrUndefined Request body, or moot when constructing the request with {@link MessageRequestOptions}.
 * @returns The response.
 */
export function fetch<T extends JsonValue = JsonValue>(requestOrPath: MessageRequestOptions | string, bodyOrUndefined?: JsonValue): Promise<MessageResponse<T>> {
	return typeof requestOrPath === "string" ? gateway.fetch(requestOrPath, bodyOrUndefined) : gateway.fetch(requestOrPath);
}

/**
 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link Action.sendToPropertyInspector}.
 * @template TPayload The type of the payload received from the property inspector.
 * @template TSettings The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDidReceivePropertyInspectorMessage<TPayload extends JsonValue = JsonValue, TSettings extends JsonObject = JsonObject>(
	listener: (ev: DidReceivePropertyInspectorMessageEvent<TPayload, TSettings>) => void
): IDisposable {
	return gateway.disposableOn("unhandledMessage", (ev) => {
		listener(new DidReceivePropertyInspectorMessageEvent<TPayload, TSettings>(new Action<TSettings>(ev), ev as DidReceivePropertyInspectorMessage<TPayload>));
	});
}

/**
 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link onPropertyInspectorDidDisappear}.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onPropertyInspectorDidAppear<T extends JsonObject = JsonObject>(listener: (ev: PropertyInspectorDidAppearEvent<T>) => void): IDisposable {
	return connection.disposableOn("propertyInspectorDidAppear", (ev) => listener(new ActionWithoutPayloadEvent<PropertyInspectorDidAppear, Action<T>>(new Action<T>(ev), ev)));
}

/**
 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link onPropertyInspectorDidAppear}.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onPropertyInspectorDidDisappear<T extends JsonObject = JsonObject>(listener: (ev: PropertyInspectorDidDisappearEvent<T>) => void): IDisposable {
	return connection.disposableOn("propertyInspectorDidDisappear", (ev) => listener(new ActionWithoutPayloadEvent<PropertyInspectorDidDisappear, Action<T>>(new Action<T>(ev), ev)));
}

/**
 * Maps fetch requests from the **property inspector**.
 * @param path Path of the route.
 * @param handler Handler to be invoked, responsible for returning a response to the property inspector.
 * @param options Optional routing configuration.
 */
export function route<TBody extends JsonValue = JsonValue>(path: string, handler: MessageHandler<Action, TBody>, options?: RouteConfiguration<Action>): void {
	gateway.route(path, handler, options);
}
