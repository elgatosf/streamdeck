import { type IDisposable } from "@elgato/utils";
import type { ZodType } from "zod";
import type { ZodMiniType } from "zod/mini";

import { RequestPool } from "./client/request-pool.js";
import type { Request } from "./client/request.js";
import type { Response } from "./client/response.js";
import type { JsonRpcConnectionOptions } from "./connection-options.js";
import * as JsonRpc from "./json-rpc/index.js";
import { MessageRouter } from "./message-router.js";
import { MessageSender } from "./message-sender.js";
import { MethodDispatcher } from "./server/method-dispatcher.js";
import type { MethodHandler } from "./server/method-handler.js";

/**
 * Connection between a local and remote target, allowing for communication with JSON-RPC.
 */
export class JsonRpcConnection {
	/**
	 * Determines whether the connection is active.
	 */
	#isConnected = false;

	/**
	 * Client request pool that contains pending requests.
	 */
	readonly #clientPool: RequestPool;

	/**
	 * Router responsible for observing the inbound stream.
	 */
	readonly #messageRouter: MessageRouter;

	/**
	 * Sender responsible for sending messages.
	 */
	readonly #messageSender: MessageSender;

	/**
	 * Server request dispatcher responsible for routing method calls.
	 */
	readonly #serverDispatcher: MethodDispatcher = new MethodDispatcher();

	/**
	 * Initializes a new instance of the {@link JsonRpcConnection} class.
	 * @param options The connection options.
	 */
	constructor(options: JsonRpcConnectionOptions) {
		const { inboundStream, outboundStream } = options;

		this.#messageSender = new MessageSender(outboundStream);
		this.#clientPool = new RequestPool(this.#messageSender);

		this.#messageRouter = new MessageRouter(
			inboundStream,
			this.#messageSender,
			this.#clientPool,
			this.#serverDispatcher,
		);
	}

	/**
	 * Adds a local method handler that will be called when the method is dispatched.
	 * @param method Method name.
	 * @param handler The handler to add.
	 * @returns Disposable used to remove the handler.
	 */
	public addLocalMethod(method: string, handler: MethodHandler<JsonRpc.Parameters>): IDisposable;
	/**
	 * Adds a local method handler that will be called when the method is dispatched.
	 * @param method Method name.
	 * @param handler The handler to add.
	 * @param paramsSchema Schema responsible for parsing the parameters.
	 * @returns Disposable used to remove the handler.
	 */
	public addLocalMethod<TParametersSchema extends JsonRpc.Parameters>(
		method: string,
		handler: MethodHandler<TParametersSchema>,
		paramsSchema: ZodMiniType<TParametersSchema, TParametersSchema> | ZodType<TParametersSchema, TParametersSchema>,
	): IDisposable;
	/**
	 * Adds a local method handler that will be called when the method is dispatched.
	 * @param method Method name.
	 * @param handler The handler to add.
	 * @param paramsSchema Schema responsible for parsing the parameters.
	 * @returns Disposable used to remove the handler.
	 */
	public addLocalMethod<TParametersSchema extends JsonRpc.Parameters>(
		method: string,
		handler: MethodHandler<TParametersSchema>,
		paramsSchema?: ZodMiniType<TParametersSchema, TParametersSchema> | ZodType<TParametersSchema, TParametersSchema>,
	): IDisposable {
		if (paramsSchema) {
			return this.#serverDispatcher.add(method, handler, paramsSchema);
		}

		return this.#serverDispatcher.add(method, handler as MethodHandler<JsonRpc.Parameters>);
	}

	/**
	 * Begins listening on the inbound stream, allowing for bi-directional communication with the remote target.
	 *
	 * The connection will remain active whilst the inbound stream is open, or until the signal is aborted.
	 * @param signal Optional signal used to abort the connection.
	 */
	public async connect(signal?: AbortSignal): Promise<void> {
		// Check if the connection is already established.
		if (this.#isConnected) {
			throw new Error("JSON-RPC connection is already connected.");
		}

		try {
			this.#isConnected = true;
			await this.#messageRouter.start(signal);
		} finally {
			this.#isConnected = false;
		}
	}

	/**
	 * Sends a notification to the JSON-RPC server without waiting for its response.
	 * @param request The request.
	 */
	public async notify(request: Request): Promise<void>;
	/**
	 * Sends a notification to the JSON-RPC server without waiting for its response.
	 * @param method Name of the method to invoke.
	 * @param params Parameters passed to the method handlers.
	 */
	public async notify(method: string, params?: JsonRpc.Parameters): Promise<void>;
	/**
	 * Sends a notification to the JSON-RPC server without waiting for its response.
	 * @param methodOrRequest The method name, or the request.
	 * @param params Parameters passed to the method handlers.
	 */
	public async notify(methodOrRequest: Request | string, params?: JsonRpc.Parameters): Promise<void> {
		if (typeof methodOrRequest === "string") {
			await this.#messageSender.send({ jsonrpc: "2.0", method: methodOrRequest, params });
		} else {
			const { method, params } = methodOrRequest;
			await this.#messageSender.send({ jsonrpc: "2.0", method, params });
		}
	}

	/**
	 * Sends the request to the JSON-RPC server.
	 * @param request The request.
	 * @returns The response.
	 */
	public async request(request: Request): Promise<Response>;
	/**
	 * Sends the request to the JSON-RPC server.
	 * @param method Name of the method to invoke.
	 * @param params Parameters passed to the method handlers.
	 * @returns The response.
	 */
	public async request(method: string, params?: JsonRpc.Parameters): Promise<Response>;
	/**
	 * Sends the request to the JSON-RPC server.
	 * @param methodOrRequest The method name, or the request.
	 * @param params Parameters passed to the method handlers.
	 * @returns The response.
	 */
	public async request(methodOrRequest: Request | string, params?: JsonRpc.Parameters): Promise<Response> {
		if (typeof methodOrRequest === "string") {
			return this.#clientPool.send({ method: methodOrRequest, params });
		} else {
			return this.#clientPool.send(methodOrRequest);
		}
	}
}
