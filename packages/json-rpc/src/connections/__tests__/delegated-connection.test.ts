import { describe, expect, test, vi } from "vitest";

import { createDelegatedJsonRpcConnection } from "../delegated-connection.js";

describe("createDelegatedJsonRpcConnection", () => {
	/**
	 * Asserts outbound messages are forwarded to the send delegate.
	 */
	test("delegates outbound messages", async () => {
		// Arrange.
		const send = vi.fn();
		const [connection] = createDelegatedJsonRpcConnection(send);

		// Act.
		await connection.notify("method", { value: 42 });

		// Assert.
		expect(send).toHaveBeenCalledExactlyOnceWith({
			jsonrpc: "2.0",
			method: "method",
			params: { value: 42 },
		});
	});

	/**
	 * Asserts inbound messages are forwarded to the connection.
	 */
	test("receives inbound messages", async () => {
		// Arrange.
		const [connection, receive] = createDelegatedJsonRpcConnection(vi.fn());
		const abortController = new AbortController();
		const abortReason = new Error("Routing complete");
		const handler = vi.fn(() => abortController.abort(abortReason));
		connection.addLocalMethod("method", handler);
		const connected = connection.connect(abortController.signal);

		// Act.
		receive({ jsonrpc: "2.0", method: "method", params: { value: 42 } });

		// Assert.
		await expect(connected).rejects.toBe(abortReason);
		expect(handler).toHaveBeenCalledExactlyOnceWith(
			{ value: 42 },
			expect.objectContaining({ canRespond: false }),
			expect.any(Function),
		);
	});
});
