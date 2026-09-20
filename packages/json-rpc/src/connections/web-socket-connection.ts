import { JsonRpcConnection } from "../connection.js";
import type * as JsonRpc from "../json-rpc/index.js";

/**
 * Creates a JSON-RPC connection whose sending and receiving is fulfilled by a WebSocket.
 * @param webSocket The WebSocket responsible for sending and receiving messages.
 * @returns The JSON-RPC connection.
 */
export function createWebSocketJsonRpcConnection(webSocket: WebSocket): JsonRpcConnection {
	// Receiving stream that wraps the WebSocket message event.
	const inboundStream = new ReadableStream<string>({
		start: (controller): void => {
			const abortController = new AbortController();
			webSocket.addEventListener(
				"message",
				(ev: MessageEvent) => {
					controller.enqueue(ev.data);
				},
				{
					signal: abortController.signal,
				},
			);

			webSocket.addEventListener(
				"close",
				() => {
					abortController.abort();
					controller.close();
				},
				{ once: true },
			);
		},
	});

	// Sending stream that wraps the WebSocket send.
	const outboundStream = new WritableStream<JsonRpc.Request | JsonRpc.Response>({
		write: (value): void => webSocket.send(JSON.stringify(value)),
	});

	webSocket.addEventListener(
		"close",
		() => {
			outboundStream.close();
		},
		{ once: true },
	);

	return new JsonRpcConnection({
		inboundStream,
		outboundStream,
	});
}
