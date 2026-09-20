import type { ReadableStreamController } from "node:stream/web";

import { JsonRpcConnection } from "../connection.js";
import type * as JsonRpc from "../json-rpc/index.js";

/**
 * Creates a JSON-RPC connection from callback functions.
 *
 * The `send` callback receives outbound messages, while the returned `receive` callback accepts
 * inbound messages.
 * @param send Delegate responsible for sending outbound message.
 * @returns The connection, and `receive` delegate responsible for handling inbound messages.
 */
export function createDelegatedJsonRpcConnection(
	send: (value: JsonRpc.Request | JsonRpc.Response) => void,
): [connection: JsonRpcConnection, receive: (value: JsonRpc.Request | JsonRpc.Response | string) => void] {
	// Receiving stream that wraps the receiver callback.
	let inboundController: ReadableStreamController<JsonRpc.Request | JsonRpc.Response | string> | undefined;
	const inboundStream = new ReadableStream<JsonRpc.Request | JsonRpc.Response | string>({
		start: (controller): void => {
			inboundController = controller;
		},
	});

	// Sending stream that wraps the sender callback.
	const outboundStream = new WritableStream<JsonRpc.Request | JsonRpc.Response>({
		write: (value): void => send(value),
	});

	return [
		new JsonRpcConnection({ inboundStream, outboundStream }),
		(value: JsonRpc.Request | JsonRpc.Response | string): void => inboundController?.enqueue(value),
	];
}
