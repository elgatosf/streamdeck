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
		const responseHandler = req.id
			? new RequestResponder(req.id, this.#connectionOptions.outboundStream)
			: new NotificationResponder();

		await this.#requestDispatcher.dispatch(method, params, responseHandler);
	}

	/**
	 * Parses the value read from the inbound stream.
	 * - Requests are dispatched to their request handlers.
	 * - Responses resolve their associated pending requests.
	 *
	 * When the value is neither a request or response, a parsing error is sent to the outbound stream.
	 * @param value Value to parse.
	 * @returns Promise that resolves when the value has been routed.
	 */
	async #parse(value: string): Promise<void> {
		let data: unknown;

		try {
			data = JSON.parse(value);
		} catch {
			return this.#sendParseError(value);
		}

		// Check if the message is a request.
		const { success: isRequest, data: req } = JsonRpc.Request.safeParse(data);
		if (isRequest) {
			return this.#dispatch(req);
		}

		// Check if the message is a response.
		const { success: isResponse, data: res } = JsonRpc.Response.safeParse(data);
		if (isResponse) {
			return this.#requestPool.resolve(res);
		}

		return this.#sendParseError(value);
	}

	/**
	 * Sends a parsing error to the outbound stream.
	 * @param value Value that could not be parsed.
	 */
	async #sendParseError(value: string): Promise<void> {
		const writer = this.#connectionOptions.outboundStream.getWriter();
		try {
			await writer.write({
				jsonrpc: "2.0",
				id: null,
				error: {
					code: JsonRpc.ErrorCode.ParseError,
					message: "Unable to parse JSON-RPC value.",
					data: value,
				},
			});
		} finally {
			writer.releaseLock();
		}
	}
}
