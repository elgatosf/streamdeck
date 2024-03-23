import type { DidReceivePluginMessage, DidReceivePropertyInspectorMessage } from "../../api";
import { EventEmitter } from "../event-emitter";
import type { JsonValue } from "../json";
import { isRequest, isResponse, type RawMessageRequest, type RawMessageResponse, type StatusCode } from "./message";
import { MessageResponseBuilder } from "./responder";

/**
 * Default request timeout.
 */
const DEFAULT_TIMEOUT = 5000;

/**
 * Message gateway responsible for sending, routing, and receiving requests and responses.
 */
export class MessageGateway<TAction> extends EventEmitter<MessageGatewayEventMap> {
	/**
	 * Requests with pending responses.
	 */
	private readonly requests = new Map<string, (res: MessageResponse) => void>();

	/**
	 * Registered routes, and their respective handlers.
	 */
	private readonly routes: Route<TAction>[] = [];

	/**
	 * Initializes a new instance of the {@link MessageGateway} class.
	 * @param proxy Proxy capable of sending messages to the plugin / property inspector.
	 * @param actionProvider Action provider responsible for retrieving actions associated with source messages.
	 */
	constructor(
		private readonly proxy: OutboundMessageProxy,
		private readonly actionProvider: ActionProvider<TAction>
	) {
		super();
	}

	/**
	 * Sends the {@link request} to the server; the server should be listening on {@link MessageGateway.route}.
	 * @param request The request.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(request: MessageRequestOptions): Promise<MessageResponse<T>>;
	/**
	 * Sends the request to the server; the server should be listening on {@link MessageGateway.route}.
	 * @param path Path of the request.
	 * @param body Optional body sent with the request.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(path: string, body?: JsonValue): Promise<MessageResponse<T>>;
	/**
	 * Sends the {@link requestOrPath} to the server; the server should be listening on {@link MessageGateway.route}.
	 * @param requestOrPath The request, or the path of the request.
	 * @param bodyOrUndefined Request body, or moot when constructing the request with {@link MessageRequestOptions}.
	 * @returns The response.
	 */
	public async fetch<T extends JsonValue = JsonValue>(requestOrPath: MessageRequestOptions | string, bodyOrUndefined?: JsonValue): Promise<MessageResponse<T>> {
		const id = crypto.randomUUID();
		const { body, path, timeout = DEFAULT_TIMEOUT, unidirectional = false } = typeof requestOrPath === "string" ? { body: bodyOrUndefined, path: requestOrPath } : requestOrPath;

		// Initialize the response handler.
		const response = new Promise<MessageResponse<T>>((resolve) => {
			this.requests.set(id, (res: MessageResponse) => {
				if (res.status !== 408) {
					clearTimeout(timeoutMonitor);
				}

				resolve(res as MessageResponse<T>);
			});
		});

		// Start the timeout, and send the request.
		const timeoutMonitor = setTimeout(() => this.handleResponse({ __type: "response", id, path, status: 408 }), timeout);
		const accepted = await this.proxy({ __type: "request", body, id, path, unidirectional } satisfies RawMessageRequest);

		// When the server did not accept the request, return a 406.
		if (!accepted) {
			this.handleResponse({ __type: "response", id, path, status: 406 });
		}

		return response;
	}

	/**
	 * Attempts to process the specified {@link message}.
	 * @param message Message to process.
	 * @returns `true` when the {@link message} was processed by this instance; otherwise `false`.
	 */
	public async process(message: DidReceivePluginMessage<JsonValue> | DidReceivePropertyInspectorMessage<JsonValue>): Promise<void> {
		if (isRequest(message.payload)) {
			// Server-side handling.
			const action = this.actionProvider(message);
			if (await this.handleRequest(action, message.payload)) {
				return;
			}

			this.emit("unhandledRequest", message as DidReceivePluginMessage<RawMessageRequest> | DidReceivePropertyInspectorMessage<RawMessageRequest>);
		} else if (isResponse(message.payload) && this.handleResponse(message.payload)) {
			// Response handled successfully.
			return;
		}

		this.emit("unhandledMessage", message);
	}

	/**
	 * Maps the specified {@link path} to the {@link handler}, allowing for requests from the client.
	 * @param path Path used to identify the route.
	 * @param handler Handler to be invoked when the request is received.
	 * @param options Optional routing configuration.
	 * @returns This instance with the route registered.
	 */
	public route<TBody extends JsonValue = JsonValue>(path: string, handler: MessageHandler<TAction, TBody>, options?: RouteConfiguration<TAction>): this {
		this.routes.push({
			handler: handler as MessageHandler<TAction, JsonValue>,
			options: { filter: () => true, ...options },
			path
		});

		return this;
	}

	/**
	 * Handles inbound requests.
	 * @param action Action associated with the request.
	 * @param source The request.
	 * @returns `true` when the request was handled; otherwise `false`.
	 */
	private async handleRequest(action: TAction, source: RawMessageRequest): Promise<boolean> {
		const res = new MessageResponseBuilder(source, this.proxy);
		const req: MessageRequest<TAction, JsonValue> = {
			action,
			path: source.path,
			unidirectional: source.unidirectional,
			body: source.body
		};

		const routes = this.routes.filter((r) => r.path === source.path && r.options.filter(req));

		// When there are no applicable routes, return not-handled.
		if (routes.length === 0) {
			await res.send(501);
			return false;
		}

		// When the request is unidirectional, send a 202 status.
		if (source.unidirectional) {
			await res.send(202);
		}

		try {
			// Route the request to the handlers in order they were registered, stopping if we have a response.
			for (const route of routes) {
				const result = await route.handler(req, res);

				// When the handler has a result, respond.
				if (result !== undefined) {
					await res.send(200, result);
				}
			}

			await res.send(200);
		} catch (err) {
			// Respond with an error before throwing.
			await res.send(500);
			throw err;
		}

		return true;
	}

	/**
	 * Handles inbound response.
	 * @param res The response.
	 * @returns `true` when the response was handled; otherwise `false`.
	 */
	private handleResponse(res: RawMessageResponse): boolean {
		const handler = this.requests.get(res.id);
		this.requests.delete(res.id);

		// Determine if there is a request pending a response.
		if (handler) {
			handler(new MessageResponse(res));
			return true;
		}

		return false;
	}
}

/**
 * Represents a message received from the plugin or the property inspector.
 */
type PluginOrPropertyInspectorMessage<T extends JsonValue> = DidReceivePluginMessage<T> | DidReceivePropertyInspectorMessage<T>;

/**
 * Event map for {@link MessageGateway}.
 */
type MessageGatewayEventMap = {
	/**
	 * Occurs when attempting to process a message that cannot be handled by the gateway.
	 */
	unhandledMessage: [message: PluginOrPropertyInspectorMessage<JsonValue>];

	/**
	 * Occurs when attempting to process a message that represents a request, but cannot be routed.
	 */
	unhandledRequest: [message: PluginOrPropertyInspectorMessage<RawMessageRequest>];
};

/**
 * Message request, received from the client.
 */
export type MessageRequest<TAction, TBody extends JsonValue = JsonValue> = Omit<RawMessageRequest, "__type" | "body" | "id"> & {
	/**
	 * Action associated with the request.
	 */
	readonly action: TAction;

	/**
	 * Body of the request.
	 */
	readonly body?: TBody;
};

/**
 * Message request options associated with a request to be sent to the server.
 */
export type MessageRequestOptions = {
	/**
	 * Body sent with the request.
	 */
	body?: JsonValue;

	/**
	 * Path of the request.
	 */
	path: string;

	/**
	 * Timeout duration in milliseconds; defaults to `5000` (5s).
	 */
	timeout?: number;

	/**
	 * Indicates whether the request is unidirectional; when `true`, a response will not be awaited.
	 */
	unidirectional?: boolean;
};

/**
 * Message response, received from the server.
 */
class MessageResponse<TBody extends JsonValue = JsonValue> {
	/**
	 * Body of the response.
	 */
	public readonly body?: TBody;

	/**
	 * Status of the response.
	 * - `200` the request was successful.
	 * - `202` the request was unidirectional, and does not have a response.
	 * - `406` the request could not be accepted by the server.
	 * - `408` the request timed-out.
	 * - `500` the request failed.
	 * - `501` the request is not implemented by the server, and could not be fulfilled.
	 */
	public readonly status: StatusCode;

	/**
	 * Initializes a new instance of the {@link MessageResponse} class.
	 * @param res The status code, or the response.
	 */
	constructor(res: RawMessageResponse) {
		this.body = res.body as TBody;
		this.status = res.status;
	}

	/**
	 * Indicates whether the request was successful.
	 * @returns `true` when the status indicates a success; otherwise `false`.
	 */
	public get ok(): boolean {
		return this.status >= 200 && this.status < 300;
	}
}

export { type MessageResponse };

/**
 * Proxy capable of sending a payload to the plugin / property inspector.
 * @param payload Payload to be sent to the server.
 * @returns `true` when the server was able to accept the response; otherwise `false`.
 */
export type OutboundMessageProxy = (payload: JsonValue) => Promise<boolean> | boolean;

/**
 * Gets the action from the specified source.
 */
export type ActionProvider<T> = (source: DidReceivePluginMessage<JsonValue> | DidReceivePropertyInspectorMessage<JsonValue>) => T;

/**
 * Function responsible for handling a request, and providing a response.
 */
export type MessageHandler<TAction, TBody extends JsonValue = JsonValue> = (
	request: MessageRequest<TAction, TBody>,
	response: MessageResponseBuilder
) => JsonValue | Promise<JsonValue | void> | void;

/**
 * Defines a messenger route.
 */
type Route<TAction, TBody extends JsonValue = JsonValue> = {
	/**
	 * The handler function.
	 */
	handler: MessageHandler<TAction, TBody>;

	/**
	 * Routing configuration.
	 */
	options: Required<RouteConfiguration<TAction, TBody>>;
	/**
	 * The path of the route, for example "/get-lights".
	 */
	path: string;
};

/**
 * Configuration that defines the route.
 */
export type RouteConfiguration<TAction, TBody extends JsonValue = JsonValue> = {
	/**
	 * Optional filter used to determine if a message can be routed; when `true`, the route handler will be called.
	 * @param action Action associated with the message.
	 * @returns Should return `true` when the request can be handled; otherwise `false`.
	 */
	filter?: (request: MessageRequest<TAction, TBody>) => boolean;
};