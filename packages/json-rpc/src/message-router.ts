import { z } from "zod/mini";

import type { RequestPool } from "./client/request-pool.js";
import * as JsonRpc from "./json-rpc/index.js";
import { MessageSender } from "./message-sender.js";
import type { MethodDispatcher } from "./server/method-dispatcher.js";
import { NotificationResponder } from "./server/responders/notification-responder.js";
import { RequestResponder } from "./server/responders/request-responder.js";

/**
 * Routes messages received on the inbound stream.
 *
 * Messages are either dispatched to their request handlers on the server, and used to resolve
 * pending requests on the client's request pool.
 */
export class MessageRouter {
	/**
	 * Client request pool that contains pending requests.
	 */
	readonly #clientPool: RequestPool;

	/**
	 * Stream responsible for receiving messages.
	 */
	readonly #inboundStream: ReadableStream<JsonRpc.Request | JsonRpc.Response | string>;

	/**
	 * Sender responsible for sending messages.
	 */
	readonly #messageSender: MessageSender;

	/**
	 * Server request dispatcher responsible for routing method calls.
	 */
	readonly #serverDispatcher: MethodDispatcher;

	/**
	 * Initializes a new instances of the {@link MessageRouter} class.
	 * @param inboundStream Stream responsible for receiving messages.
	 * @param messageSender Sender responsible for sending outbound messages.
	 * @param clientPool Client request pool.
	 * @param serverDispatcher Server request dispatcher.
	 */
	constructor(
		inboundStream: ReadableStream<JsonRpc.Request | JsonRpc.Response | string>,
		messageSender: MessageSender,
		clientPool: RequestPool,
		serverDispatcher: MethodDispatcher,
	) {
		this.#inboundStream = inboundStream;
		this.#messageSender = messageSender;
		this.#clientPool = clientPool;
		this.#serverDispatcher = serverDispatcher;
	}

	/**
	 * Continually reads the inbound stream and attempts to parse read data as JSON-RPC messages.
	 * @param signal Optional signal used to abort routing.
	 */
	public async start(signal?: AbortSignal): Promise<void> {
		const reader = this.#inboundStream.getReader();
		const pending = new Set<Promise<void>>();

		const cancel = (): Promise<void> => reader.cancel(signal?.reason);
		signal?.addEventListener("abort", cancel, { once: true });

		try {
			if (signal?.aborted) {
				await reader.cancel(signal.reason);
				signal.throwIfAborted();
			}

			// Continually read from the inbound stream until aborted or done.
			while (!signal?.aborted) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}

				// Route the received value, without blocking.
				const routing = this.#parse(value);
				pending.add(routing);
				routing.then(
					() => pending.delete(routing),
					() => pending.delete(routing),
				);
			}

			await Promise.allSettled(pending);
			signal?.throwIfAborted();
		} finally {
			signal?.removeEventListener("abort", cancel);
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
			? new RequestResponder(req.id!, this.#messageSender)
			: new NotificationResponder();

		await this.#serverDispatcher.dispatch(method, params, responseHandler);
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
			return this.#clientPool.resolve(data);
		}

		return this.#sendError(
			{
				code: JsonRpc.ErrorCode.InvalidRequest,
				message: "Invalid JSON-RPC request.",
				data: message,
			},
			z.validate(JsonRpc.Identifiable, data) ? data.id : null,
		);
	}

	/**
	 * Sends an error response to the outbound stream.
	 * @param error Error to send.
	 * @param id Identifier associated with the error.
	 */
	async #sendError(error: JsonRpc.Error, id: JsonRpc.Id = null): Promise<void> {
		await this.#messageSender.send({ jsonrpc: "2.0", id, error });
	}
}
