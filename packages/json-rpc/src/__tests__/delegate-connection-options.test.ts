import { describe, expect, test, vi } from "vitest";

import { createDelegateJsonRpcConnectionOptions } from "../delegate-connection-options.js";
import * as JsonRpc from "../json-rpc/index.js";

describe("createDelegateJsonRpcConnectionOptions", () => {
	/**
	 * Asserts received values are added to the inbound stream.
	 */
	test("adds received values to the inbound stream", async () => {
		// Arrange.
		const options = createDelegateJsonRpcConnectionOptions(vi.fn());
		const reader = options.inboundStream.getReader();

		try {
			// Act.
			options.receive("first");
			options.receive("second");

			// Assert.
			await expect(reader.read()).resolves.toEqual({ done: false, value: "first" });
			await expect(reader.read()).resolves.toEqual({ done: false, value: "second" });
		} finally {
			reader.releaseLock();
		}
	});

	/**
	 * Asserts request writes are forwarded to the send delegate.
	 */
	test("delegates sending requests", async () => {
		// Arrange.
		const send = vi.fn();
		const options = createDelegateJsonRpcConnectionOptions(send);
		const writer = options.outboundStream.getWriter();
		const request: JsonRpc.Request = {
			id: "request-id",
			jsonrpc: "2.0",
			method: "method",
			params: { value: 42 },
		};

		try {
			// Act.
			await writer.write(request);

			// Assert.
			expect(send).toHaveBeenCalledExactlyOnceWith(request);
		} finally {
			writer.releaseLock();
		}
	});

	/**
	 * Asserts response writes are forwarded to the send delegate.
	 */
	test("delegates sending responses", async () => {
		// Arrange.
		const send = vi.fn();
		const options = createDelegateJsonRpcConnectionOptions(send);
		const writer = options.outboundStream.getWriter();
		const response: JsonRpc.Response = {
			id: "request-id",
			jsonrpc: "2.0",
			result: "result",
		};

		try {
			// Act.
			await writer.write(response);

			// Assert.
			expect(send).toHaveBeenCalledExactlyOnceWith(response);
		} finally {
			writer.releaseLock();
		}
	});
});
