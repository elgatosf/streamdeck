import { JsonRpcConnection } from "../connection.js";
import type * as JsonRpc from "../json-rpc/index.js";

/**
 * Creates a JSON-RPC connection whose sending and receiving is fulfilled by a WebSocket.
 * @param webSocket The WebSocket responsible for sending and receiving messages.
 * @returns The JSON-RPC connection.
 */
export function createWebSocketJsonRpcConnection(webSocket: WebSocket): JsonRpcConnection {
	// Receiving stream that wraps the WebSocket message event.
	const inboundAbortController = new AbortController();
	const inboundStream = new ReadableStream<string>({
		start: (controller): void => {
			webSocket.addEventListener(
				"message",
				(ev: MessageEvent) => {
					controller.enqueue(ev.data);
				},
				{
					signal: inboundAbortController.signal,
				},
			);

			webSocket.addEventListener(
				"close",
				() => {
					inboundAbortController.abort();
					controller.close();
				},
				{ once: true, signal: inboundAbortController.signal },
			);
		},
		cancel: (): void => inboundAbortController.abort(),
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
