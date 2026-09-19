import type { ReadableStreamController } from "node:stream/web";

import type { JsonRpcConnectionOptions } from "./connection-options.js";
import type * as JsonRpc from "./json-rpc/index.js";

/**
 * Creates options for a JSON-RPC connection whose sending and receiving streams are delegated to
 * functions
 *
 * The `send` parameter is responsible for sending output messages, and the `receive` property
 * returned as part of these options is responsible for receiving inbound messages.
 * @param send Delegate responsible for sending data.
 * @returns The options.
 */
export function createDelegateJsonRpcConnectionOptions(
	send: (value: JsonRpc.Request | JsonRpc.Response) => void,
): DelegateJsonRpcConnectionOptions {
	// Receiving stream that wraps the receiver callback.
	let inboundController: ReadableStreamController<string> | undefined;
	const inboundStream = new ReadableStream<string>({
		start: (controller): void => {
			inboundController = controller;
		},
	});

	// Sending stream that wraps the sender callback.
	const outboundStream = new WritableStream<JsonRpc.Request | JsonRpc.Response>({
		write: (value): void => send(value),
	});

	return {
		receive: (value: string): void => inboundController?.enqueue(value),
		inboundStream,
		outboundStream,
	};
}

/**
 * Options associated with a JSON-RPC connection whose streams have been delegated to functions.
 */
export interface DelegateJsonRpcConnectionOptions extends JsonRpcConnectionOptions {
	/**
	 * Sends the value to the receiving stream, allowing it to be processed by the connection.
	 * @param value Value being received.
	 */
	receive: (value: string) => void;
}
