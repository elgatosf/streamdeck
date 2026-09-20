import { describe, expect, test, vi } from "vitest";

import { createWebSocketJsonRpcConnection } from "../web-socket-connection.js";

describe("createWebSocketJsonRpcConnection", () => {
	/**
	 * Asserts outbound messages are serialized and sent through the WebSocket.
	 */
	test("sends outbound messages", async () => {
		// Arrange.
		const send = vi.fn();
		const webSocket = createWebSocket(send);
		const connection = createWebSocketJsonRpcConnection(webSocket);

		// Act.
		await connection.notify("method", { value: 42 });

		// Assert.
		expect(send).toHaveBeenCalledExactlyOnceWith(
			JSON.stringify({
				jsonrpc: "2.0",
				method: "method",
				params: { value: 42 },
			}),
		);
	});

	/**
	 * Asserts WebSocket messages are forwarded to the connection.
	 */
	test("receives inbound messages", async () => {
		// Arrange.
		const webSocket = createWebSocket(vi.fn());
		const connection = createWebSocketJsonRpcConnection(webSocket);
		const abortController = new AbortController();
		const abortReason = new Error("Routing complete");
		const handler = vi.fn(() => abortController.abort(abortReason));
		connection.addLocalMethod("method", handler);
		const connected = connection.connect(abortController.signal);

		// Act.
		webSocket.dispatchEvent(
			new MessageEvent("message", {
				data: JSON.stringify({ jsonrpc: "2.0", method: "method", params: { value: 42 } }),
			}),
		);

		// Assert.
		await expect(connected).rejects.toBe(abortReason);
		expect(handler).toHaveBeenCalledExactlyOnceWith(
			{ value: 42 },
			expect.objectContaining({ canRespond: false }),
			expect.any(Function),
		);
	});

	/**
	 * Asserts closing the WebSocket closes the outbound stream.
	 */
	test("closes outbound messaging with the WebSocket", async () => {
		// Arrange.
		const webSocket = createWebSocket(vi.fn());
		const connection = createWebSocketJsonRpcConnection(webSocket);

		// Act.
		webSocket.dispatchEvent(new Event("close"));

		// Assert.
		await expect(connection.notify("method")).rejects.toThrow();
	});
});

/**
 * Creates a WebSocket-compatible event target.
 * @param send Mock WebSocket send function.
 * @returns The WebSocket mock.
 */
function createWebSocket(send: ReturnType<typeof vi.fn>): WebSocket {
	return Object.assign(new EventTarget(), { send }) as unknown as WebSocket;
}
