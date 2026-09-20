import { afterEach, describe, expect, type Mock, test, vi } from "vitest";

import * as JsonRpc from "../../json-rpc/index.js";
import { MessageSender } from "../../message-sender.js";
import { RequestPool } from "../request-pool.js";

const requestId = "00000000-0000-4000-8000-000000000000";

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe("RequestPool", () => {
	/**
	 * Provides assertions for `resolve(response)`.
	 */
	describe("resolve", () => {
		/**
		 * Asserts a success response resolves its pending request.
		 */
		test("resolves a successful request", async () => {
			// Arrange.
			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);

			const requestPool = new RequestPool(new MessageSender(new WritableStream()));
			const response = requestPool.send({ method: "method" });

			// Act.
			requestPool.resolve({
				id: requestId,
				jsonrpc: "2.0",
				result: "result",
			});

			// Assert.
			await expect(response).resolves.toEqual({
				ok: true,
				result: "result",
			});
		});

		/**
		 * Asserts an error response resolves its pending request.
		 */
		test("resolves a failed request", async () => {
			// Arrange.
			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);

			const requestPool = new RequestPool(new MessageSender(new WritableStream()));
			const response = requestPool.send({ method: "method" });

			const error: JsonRpc.Error = {
				code: JsonRpc.ErrorCode.InternalError,
				message: "Internal error",
			};

			// Act.
			requestPool.resolve({
				error,
				id: requestId,
				jsonrpc: "2.0",
			});

			// Assert.
			await expect(response).resolves.toEqual({
				error,
				ok: false,
			});
		});

		/**
		 * Asserts a response without an identifier is ignored.
		 */
		test("ignores a response without an identifier", async () => {
			// Arrange.
			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);
			const requestPool = new RequestPool(new MessageSender(new WritableStream()));
			const response = requestPool.send({ method: "method" });

			// Act.
			requestPool.resolve({
				error: {
					code: JsonRpc.ErrorCode.InternalError,
					message: "Unidentifiable error",
				},
				id: null,
				jsonrpc: "2.0",
			});

			requestPool.resolve({
				id: requestId,
				jsonrpc: "2.0",
				result: "result",
			});

			// Assert.
			await expect(response).resolves.toEqual({
				ok: true,
				result: "result",
			});
		});

		/**
		 * Asserts an unknown response does not affect a pending request.
		 */
		test("ignores an unknown identifier", async () => {
			// Arrange.
			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);

			const requestPool = new RequestPool(new MessageSender(new WritableStream()));
			const response = requestPool.send({ method: "method" });

			// Act.
			requestPool.resolve({
				id: "unknown",
				jsonrpc: "2.0",
				result: "unknown result",
			});

			requestPool.resolve({
				id: requestId,
				jsonrpc: "2.0",
				result: "result",
			});

			// Assert.
			await expect(response).resolves.toEqual({
				ok: true,
				result: "result",
			});
		});

		/**
		 * Asserts only the first response resolves a request.
		 */
		test("ignores successive responses", async () => {
			// Arrange.
			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);

			const requestPool = new RequestPool(new MessageSender(new WritableStream()));
			const response = requestPool.send({ method: "method" });

			// Act.
			requestPool.resolve({ id: requestId, jsonrpc: "2.0", result: "first" });
			requestPool.resolve({ id: requestId, jsonrpc: "2.0", result: "second" });

			// Assert.
			await expect(response).resolves.toEqual({
				ok: true,
				result: "first",
			});
		});
	});

	/**
	 * Provides assertions for `send(request)`.
	 */
	describe("send", () => {
		/**
		 * Asserts a request is written to the sending stream.
		 */
		test("sends the request", async () => {
			// Arrange.
			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);

			const { releaseLock, sendingStream, write } = createSendingStream();
			const requestPool = new RequestPool(new MessageSender(sendingStream));

			// Act.
			const response = requestPool.send({
				method: "method",
				params: { value: 42 },
			});

			requestPool.resolve({
				id: requestId,
				jsonrpc: "2.0",
				result: null,
			});

			await response;

			// Assert.
			expect(write).toHaveBeenCalledExactlyOnceWith({
				id: requestId,
				jsonrpc: "2.0",
				method: "method",
				params: { value: 42 },
			});
			expect(releaseLock).toHaveBeenCalledExactlyOnceWith();
		});

		/**
		 * Asserts omitted parameters are not included in the request.
		 */
		test("omits undefined request parameters", async () => {
			// Arrange.
			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);
			const { sendingStream, write } = createSendingStream();
			const requestPool = new RequestPool(new MessageSender(sendingStream));

			// Act.
			const response = requestPool.send({ method: "method" });
			requestPool.resolve({ id: requestId, jsonrpc: "2.0", result: null });
			await response;

			// Assert.
			expect(write).toHaveBeenCalledExactlyOnceWith({
				id: requestId,
				jsonrpc: "2.0",
				method: "method",
			});
		});

		/**
		 * Asserts each request receives a generated identifier.
		 */
		test("generates an identifier for each request", async () => {
			// Arrange.
			const nextRequestId = "00000000-0000-4000-8000-000000000001";
			vi.spyOn(crypto, "randomUUID").mockReturnValueOnce(requestId).mockReturnValueOnce(nextRequestId);

			const { sendingStream, write } = createSendingStream();
			const requestPool = new RequestPool(new MessageSender(sendingStream));

			// Act.
			const firstResponse = requestPool.send({ method: "first" });
			const secondResponse = requestPool.send({ method: "second" });

			requestPool.resolve({
				id: requestId,
				jsonrpc: "2.0",
				result: null,
			});

			requestPool.resolve({
				id: nextRequestId,
				jsonrpc: "2.0",
				result: null,
			});

			await Promise.all([firstResponse, secondResponse]);

			// Assert.
			expect(write).toHaveBeenNthCalledWith(1, expect.objectContaining({ id: requestId }));
			expect(write).toHaveBeenNthCalledWith(2, expect.objectContaining({ id: nextRequestId }));
		});

		/**
		 * Asserts a failed write clears its pending request state.
		 */
		test("cleans up when sending fails", async () => {
			// Arrange.
			vi.useFakeTimers();
			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);
			const clearTimeout = vi.spyOn(globalThis, "clearTimeout");
			const error = new Error("Unable to send request");
			const { releaseLock, sendingStream, write } = createSendingStream();
			write.mockRejectedValue(error);
			const requestPool = new RequestPool(new MessageSender(sendingStream));

			// Act, assert.
			await expect(requestPool.send({ method: "method" })).rejects.toBe(error);
			expect(clearTimeout).toHaveBeenCalledExactlyOnceWith(expect.anything());
			expect(releaseLock).toHaveBeenCalledExactlyOnceWith();
		});
	});

	/**
	 * Provides assertions for request timeouts.
	 */
	describe("timeout", () => {
		/**
		 * Asserts a pending request resolves with an error after its timeout.
		 */
		test("resolves a timed-out request", async () => {
			// Arrange.
			vi.useFakeTimers();
			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);

			const requestPool = new RequestPool(new MessageSender(new WritableStream()));
			const response = requestPool.send({ method: "method", timeout: 100 });

			// Act.
			await vi.advanceTimersByTimeAsync(100);

			// Assert.
			await expect(response).resolves.toEqual({
				error: {
					code: JsonRpc.ErrorCode.InternalError,
					message: "The request timed out.",
				},
				ok: false,
			});
		});

		/**
		 * Asserts resolving a request clears its timeout.
		 */
		test("clears the timeout after resolving", async () => {
			// Arrange.
			vi.useFakeTimers();
			const clearTimeout = vi.spyOn(globalThis, "clearTimeout");

			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);

			const requestPool = new RequestPool(new MessageSender(new WritableStream()));
			const response = requestPool.send({ method: "method", timeout: 100 });

			// Act.
			requestPool.resolve({ id: requestId, jsonrpc: "2.0", result: "result" });

			// Assert.
			await expect(response).resolves.toEqual({ ok: true, result: "result" });
			expect(clearTimeout).toHaveBeenCalledExactlyOnceWith(expect.anything());
		});
	});
});

/**
 * Creates a mocked sending stream.
 * @returns The sending stream and its mock functions.
 */
function createSendingStream(): {
	releaseLock: Mock;
	sendingStream: WritableStream<JsonRpc.Request | JsonRpc.Response>;
	write: Mock;
} {
	const releaseLock = vi.fn();
	const write = vi.fn();
	const sendingStream = {
		getWriter: () => ({ releaseLock, write }),
	} as unknown as WritableStream<JsonRpc.Request | JsonRpc.Response>;

	return {
		releaseLock,
		sendingStream,
		write,
	};
}
