import { describe, expect, test, vi } from "vitest";

import * as JsonRpc from "../../../json-rpc/index.js";
import { RequestResponder } from "../request-responder.js";

const requestId = "00000000-0000-4000-8000-000000000000";
const error: JsonRpc.Error = {
	code: JsonRpc.ErrorCode.InternalError,
	message: "Internal error",
};

describe("RequestResponder", () => {
	/**
	 * Provides assertions for `canRespond`.
	 */
	describe("canRespond", () => {
		/**
		 * Asserts a responder can respond before sending a success response.
		 */
		test("true before success", () => {
			// Arrange, act, assert.
			const { responder } = createResponder();
			expect(responder.canRespond).toBe(true);
		});

		/**
		 * Asserts a responder can respond before sending a response.
		 */
		test("true before send", () => {
			// Arrange, act, assert.
			const { responder } = createResponder();
			expect(responder.canRespond).toBe(true);
		});

		/**
		 * Asserts a responder cannot respond after sending an error response.
		 */
		test("false after error", async () => {
			// Arrange.
			const { responder } = createResponder();

			// Act.
			await responder.error(error);

			// Assert.
			expect(responder.canRespond).toBe(false);
		});

		/**
		 * Asserts a responder cannot respond after sending a success response.
		 */
		test("false after success", async () => {
			// Arrange.
			const { responder } = createResponder();

			// Act.
			await responder.success("result");

			// Assert.
			expect(responder.canRespond).toBe(false);
		});
	});

	/**
	 * Provides assertions for `error(error)`.
	 */
	describe("error", () => {
		/**
		 * Asserts an error response is propagated to the sending stream.
		 */
		test("propagates to sending stream", async () => {
			// Arrange.
			const { responder, write } = createResponder();

			// Act.
			await responder.error(error);

			// Assert.
			expect(write).toHaveBeenCalledExactlyOnceWith({
				error,
				id: requestId,
				jsonrpc: "2.0",
			});
		});

		/**
		 * Asserts an error response cannot be sent after an error response.
		 */
		test("throws error after error", async () => {
			// Arrange.
			const { responder } = createResponder();

			// Act.
			await responder.error(error);

			// Assert.
			await expect(responder.error(error)).rejects.toThrowError("Cannot send response as one has already been sent.");
		});

		/**
		 * Asserts an error response cannot be sent after a success response.
		 */
		test("throws error after success", async () => {
			// Arrange.
			const { responder } = createResponder();

			// Act.
			await responder.success("result");

			// Assert.
			await expect(responder.error(error)).rejects.toThrowError("Cannot send response as one has already been sent.");
		});
	});

	/**
	 * Provides assertions for `success(result)`.
	 */
	describe("success", () => {
		/**
		 * Asserts a success response is propagated to the sending stream.
		 */
		test("propagates to sending stream", async () => {
			// Arrange.
			const { responder, write } = createResponder();

			// Act.
			await responder.success("Hello world");

			// Assert.
			expect(write).toHaveBeenCalledExactlyOnceWith({
				id: requestId,
				jsonrpc: "2.0",
				result: "Hello world",
			});
		});

		/**
		 * Asserts a success response cannot be sent after an error response.
		 */
		test("throws error after error", async () => {
			// Arrange.
			const { responder } = createResponder();

			// Act.
			await responder.error(error);

			// Assert.
			await expect(responder.success("result")).rejects.toThrowError(
				"Cannot send response as one has already been sent.",
			);
		});

		/**
		 * Asserts a success response cannot be sent after a success response.
		 */
		test("throws error after success", async () => {
			// Arrange.
			const { responder } = createResponder();

			// Act.
			await responder.success("result");

			// Assert.
			await expect(responder.success("result")).rejects.toThrowError(
				"Cannot send response as one has already been sent.",
			);
		});
	});
});

/**
 * Creates a request responder with a mocked sending stream.
 * @returns The responder and mocked stream write function.
 */
function createResponder(): { responder: RequestResponder; write: ReturnType<typeof vi.fn> } {
	const write = vi.fn();
	const sendingStream = {
		getWriter: () => ({
			releaseLock: vi.fn(),
			write,
		}),
	} as unknown as WritableStream<JsonRpc.Response>;

	return {
		responder: new RequestResponder(requestId, sendingStream),
		write,
	};
}
