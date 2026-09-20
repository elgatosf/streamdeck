import { z } from "zod/mini";

import type { RequestPool } from "./client/request-pool.js";
import type { JsonRpcConnectionOptions } from "./connection-options.js";
import * as JsonRpc from "./json-rpc/index.js";
import type { MethodDispatcher } from "./server/method-dispatcher.js";
import { NotificationResponder } from "./server/responders/notification-responder.js";
import { RequestResponder } from "./server/responders/request-responder.js";

/**
 * Routes messages received on the inbound stream.
 *
 * Messages are either dispatched to their request handlers on the server, and used to resolve
 * pending requests on the client's request pool.
 */
export class InboundMessageRouter {
	/**
	 * Server request dispatcher responsible for routing method calls.
	 */
	#requestDispatcher: MethodDispatcher;

	/**
	 * Client request pool that contains pending requests.
	 */
	#requestPool: RequestPool;

	/**
	 * Connection options that include the inbound and outbound streams.
	 */
	#connectionOptions: JsonRpcConnectionOptions;

	/**
	 * Initializes a new instances of the {@link InboundMessageRouter} class.
	 * @param connectionOptions Connection options.
	 * @param requestPool Client request pool.
	 * @param requestDispatcher Server request dispatcher.
	 */
	constructor(
		connectionOptions: JsonRpcConnectionOptions,
		requestPool: RequestPool,
		requestDispatcher: MethodDispatcher,
	) {
		this.#connectionOptions = connectionOptions;
		this.#requestPool = requestPool;
		this.#requestDispatcher = requestDispatcher;
	}

	/**
	 * Continually reads the inbound stream and attempts to parse read data as  JSON-RPC messages.
	 * Reading continues until the inbound stream is closed, or the signal is aborted.
	 * @param signal Abort signal used to stream reading.
	 */
	public async start(signal: AbortSignal): Promise<void> {
		const reader = this.#connectionOptions.inboundStream.getReader();

		try {
			// Continually read from the inbound stream until aborted or done.
			while (!signal?.aborted) {
				const { done, value } = await reader.read();
				if (done) {
					return;
				}

				// Parse the received value.
				await this.#parse(value);
			}
		} finally {
			reader.releaseLock();
		}
	}

	/**
	 * Handles an inbound request from a client.
	 * @param req The request.
	 */
	async #dispatch(req: JsonRpc.Request): Promise<void> {
		const { method, params } = req;
		const responseHandler = Object.hasOwn(req, "id")
			? new RequestResponder(req.id!, this.#connectionOptions.outboundStream)
			: new NotificationResponder();

		await this.#requestDispatcher.dispatch(method, params, responseHandler);
	}

	/**
	 * Parses the message read from the inbound stream.
	 * - Requests are dispatched to their request handlers.
	 * - Responses resolve their associated pending requests.
	 *
	 * When the message is neither a request or response, a parsing error is sent to the outbound
	 * stream.
	 * @param message The inbound message to parse.
	 * @returns Promise that resolves when the value has been routed.
	 */
	async #parse(message: JsonRpc.Request | JsonRpc.Response | string): Promise<void> {
		let data: unknown;

		if (typeof message === "string")
			try {
				data = JSON.parse(message);
			} catch {
				return this.#sendError({
					code: JsonRpc.ErrorCode.ParseError,
					message: "Unable to parse JSON-RPC value.",
					data: message,
				});
			}
		else {
			data = message;
		}

		// Check if the message is a request.
		if (z.validate(JsonRpc.Request, data)) {
			return this.#dispatch(data);
		}

		// Check if the message is a response.
		if (z.validate(JsonRpc.Response, data)) {
			return this.#requestPool.resolve(data);
		}

		return this.#sendError({
			code: JsonRpc.ErrorCode.InvalidRequest,
			message: "Invalid JSON-RPC request.",
			data: message,
		});
	}

	/**
	 * Sends an error response to the outbound stream.
	 * @param error Error to send.
	 */
	async #sendError(error: JsonRpc.Error): Promise<void> {
		const writer = this.#connectionOptions.outboundStream.getWriter();
		try {
			await writer.write({
				jsonrpc: "2.0",
				id: null,
				error,
			});
		} finally {
			writer.releaseLock();
		}
	}
}
