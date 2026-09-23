import type * as JsonRpc from "./json-rpc/index.js";

/**
 * Serializes JSON-RPC messages written to an outbound stream.
 */
export class MessageSender {
	/**
	 * Stream responsible for sending messages.
	 */
	readonly #outboundStream: WritableStream<JsonRpc.Request | JsonRpc.Response>;

	/**
	 * Promise that completes when all queued writes have settled.
	 */
	#pending: Promise<void> = Promise.resolve();

	/**
	 * Initializes a new message sender.
	 * @param outboundStream Stream responsible for sending messages.
	 */
	constructor(outboundStream: WritableStream<JsonRpc.Request | JsonRpc.Response>) {
		this.#outboundStream = outboundStream;
	}

	/**
	 * Queues a message to be written to the outbound stream.
	 * @param message Message to write.
	 * @returns A promise that completes when the message has been written.
	 */
	public send(message: JsonRpc.Request | JsonRpc.Response): Promise<void> {
		const result = this.#pending.then(async () => {
			const writer = this.#outboundStream.getWriter();
			try {
				await writer.write(message);
			} finally {
				writer.releaseLock();
			}
		});

		this.#pending = result.catch(() => undefined);

		return result;
	}
}
