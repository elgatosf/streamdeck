import { type IDisposable, withResolvers } from "@elgato/utils";
import type { ZodType } from "zod";
import type { ZodMiniType } from "zod/mini";

import { RequestPool } from "./client/request-pool.js";
import type { Request } from "./client/request.js";
import type { Response } from "./client/response.js";
import type { JsonRpcConnectionOptions } from "./connection-options.js";
import { InboundMessageRouter } from "./inbound-message-router.js";
import * as JsonRpc from "./json-rpc/index.js";
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
	 * Router responsible for observing the inbound stream.
	 */
	readonly #inboundMessageRouter: InboundMessageRouter;

	/**
	 * Stream responsible for sending data.
	 */
	readonly #outboundStream: WritableStream<JsonRpc.Request | JsonRpc.Response>;

	/**
	 * Server request dispatcher responsible for routing method calls.
	 */
	readonly #requestDispatcher: MethodDispatcher = new MethodDispatcher();

	/**
	 * Client request pool that contains pending requests.
	 */
	readonly #requestPool: RequestPool;

	/**
	 * Initializes a new instance of the {@link JsonRpcConnection} class.
	 * @param options The connection options.
	 */
	constructor(options: JsonRpcConnectionOptions) {
		const { inboundStream, outboundStream } = options;

		this.#outboundStream = outboundStream;
		this.#requestPool = new RequestPool(outboundStream);

		this.#inboundMessageRouter = new InboundMessageRouter(
			{ inboundStream, outboundStream },
			this.#requestPool,
			this.#requestDispatcher,
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
			return this.#requestDispatcher.add(method, handler, paramsSchema);
		}

		return this.#requestDispatcher.add(method, handler as MethodHandler<JsonRpc.Parameters>);
	}

	/**
	 * Begins listening on the inbound stream, allowing for bi-directional communication with the remote target.
	 *
	 * The connection will remain active whilst the inbound stream is open, or until the signal is aborted.
	 * @param signal Optional abort signal used to determine the connection.
	 */
	public async connect(signal?: AbortSignal): Promise<void> {
		// Check if the connection is already established.
		if (this.#isConnected) {
			throw new Error("JSON-RPC connection is already connected.");
		}

		const { promise, resolve, reject } = withResolvers();

		// Configure the abort signal to throw an error for callers awaiting the connection.
		if (signal) {
			signal.onabort = (): void => reject("JSON-RPC connection was aborted.");
		}

		try {
			this.#isConnected = true;

			// Start reading from the inbound stream.
			await Promise.race([
				this.#inboundMessageRouter.start(signal ?? new AbortController().signal),
				promise,
			]);
		} finally {
			// Clean-up the resolvers.
			this.#isConnected = false;
			resolve();
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
			await this.#send({ jsonrpc: "2.0", method: methodOrRequest, params });
		} else {
			const { method, params } = methodOrRequest;
			await this.#send({ jsonrpc: "2.0", method, params });
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
			return this.#requestPool.send({ method: methodOrRequest, params });
		} else {
			return this.#requestPool.send(methodOrRequest);
		}
	}

	/**
	 * Sends the JSON-RPC value to the outbound stream.
	 * @param value Value to send.
	 */
	async #send(value: JsonRpc.Request | JsonRpc.Response): Promise<void> {
		const writer = this.#outboundStream.getWriter();
		try {
			await writer.write(value);
		} finally {
			writer.releaseLock();
		}
	}
}
