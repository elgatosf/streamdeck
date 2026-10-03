import { describe, expect, test, vi } from "vitest";
import { z as zod } from "zod";
import { z as zodMini } from "zod/mini";

import * as JsonRpc from "../../json-rpc/index.js";
import { MethodDispatcher } from "../method-dispatcher.js";
import type { MethodHandler } from "../method-handler.js";
import type { Responder } from "../responder.js";

describe("MethodDispatcher", () => {
	/**
	 * Provides assertions for `dispatch(method, params, responseHandler)`.
	 */
	describe("dispatch", () => {
		/**
		 * Asserts an unknown method produces a method-not-found response.
		 */
		test("responds with an error when no handlers are registered", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();

			// Act.
			await dispatcher.dispatch("unknown", {}, responder);

			// Assert.
			expect(responder.error).toHaveBeenCalledExactlyOnceWith({
				code: JsonRpc.ErrorCode.MethodNotFound,
				message: "No method handlers found for: unknown",
			});
			expect(responder.success).not.toHaveBeenCalled();
		});

		/**
		 * Asserts a registered handler receives the request context.
		 */
		test("invokes a registered handler", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			const handler = vi.fn<MethodHandler<JsonRpc.Parameters>>().mockReturnValue("result");
			const params = { value: 42 };

			dispatcher.add("method", handler);

			// Act.
			await dispatcher.dispatch("method", params, responder);

			// Assert.
			expect(handler).toHaveBeenCalledExactlyOnceWith(params, responder, expect.any(Function));
			expect(responder.success).toHaveBeenCalledExactlyOnceWith("result");
		});

		/**
		 * Asserts handlers can delegate to the next registered handler.
		 */
		test("chains registered handlers", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			const invocations: string[] = [];

			const first: MethodHandler<JsonRpc.Parameters> = (_params, _responder, next) => {
				invocations.push("first");
				return next();
			};

			const second: MethodHandler<JsonRpc.Parameters> = () => {
				invocations.push("second");
				return "result";
			};

			dispatcher.add("method", first);
			dispatcher.add("method", second);

			// Act.
			await dispatcher.dispatch("method", {}, responder);

			// Assert.
			expect(invocations).toEqual(["first", "second"]);
			expect(responder.success).toHaveBeenCalledExactlyOnceWith("result");
		});

		/**
		 * Asserts an asynchronous handler result is sent to the responder.
		 */
		test("awaits an asynchronous handler", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			const handler: MethodHandler<JsonRpc.Parameters> = async () => Promise.resolve("result");
			dispatcher.add("method", handler);

			// Act.
			await dispatcher.dispatch("method", {}, responder);

			// Assert.
			expect(responder.success).toHaveBeenCalledExactlyOnceWith("result");
		});

		/**
		 * Asserts response write failures are propagated to the caller.
		 */
		test("awaits the success response", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			const error = new Error("Unable to write response");
			vi.mocked(responder.success).mockRejectedValue(error);
			dispatcher.add("method", () => "result");

			// Act and assert.
			await expect(dispatcher.dispatch("method", {}, responder)).rejects.toBe(error);
			expect(responder.error).not.toHaveBeenCalled();
		});

		/**
		 * Asserts an empty handler result is sent as JSON-RPC null.
		 */
		test("converts an empty result to null", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			dispatcher.add("method", () => undefined);

			// Act.
			await dispatcher.dispatch("method", {}, responder);

			// Assert.
			expect(responder.success).toHaveBeenCalledExactlyOnceWith(null);
		});

		/**
		 * Asserts no result is sent when a handler has already responded.
		 */
		test("does not respond after a handler responds", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder(false);
			dispatcher.add("method", () => "result");

			// Act.
			await dispatcher.dispatch("method", {}, responder);

			// Assert.
			expect(responder.success).not.toHaveBeenCalled();
		});

		/**
		 * Asserts handler errors produce an internal-error response.
		 */
		test("responds with an internal error when a handler throws", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			dispatcher.add("method", () => {
				throw new Error("Something went wrong");
			});

			// Act.
			await dispatcher.dispatch("method", {}, responder);

			// Assert.
			expect(responder.error).toHaveBeenCalledExactlyOnceWith({
				code: JsonRpc.ErrorCode.InternalError,
				data: {},
				message: "Something went wrong",
			} satisfies JsonRpc.Error);
		});

		/**
		 * Asserts primitive thrown values produce a generic error message.
		 */
		test("handles a primitive thrown by a handler", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			dispatcher.add("method", () => {
				throw "failure";
			});

			// Act.
			await dispatcher.dispatch("method", {}, responder);

			// Assert.
			expect(responder.error).toHaveBeenCalledExactlyOnceWith({
				code: JsonRpc.ErrorCode.InternalError,
				data: "failure",
				message: "Unknown error",
			} satisfies JsonRpc.Error);
		});

		/**
		 * Asserts unserializable thrown values still produce an internal-error response.
		 */
		test("handles a circular object thrown by a handler", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			const error: Record<string, unknown> = {};
			error.error = error;
			dispatcher.add("method", () => {
				throw error;
			});

			// Act.
			await dispatcher.dispatch("method", {}, responder);

			// Assert.
			expect(responder.error).toHaveBeenCalledExactlyOnceWith({
				code: JsonRpc.ErrorCode.InternalError,
				message: "[object Object]",
			} satisfies JsonRpc.Error);
		});
	});

	/**
	 * Provides assertions for `add(method, handler)`.
	 */
	describe("add", () => {
		/**
		 * Asserts a handler is invoked when parameters satisfy a classic Zod schema.
		 */
		test("validates parameters with a classic Zod schema", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			const handler = vi.fn<MethodHandler<{ value: number }>>().mockReturnValue("result");
			const params = { value: 42 };
			const paramsSchema = zod.object({ value: zod.number() });
			dispatcher.add("method", handler, paramsSchema);

			// Act.
			await dispatcher.dispatch("method", params, responder);

			// Assert.
			expect(handler).toHaveBeenCalledExactlyOnceWith(params, responder, expect.any(Function));
			expect(responder.success).toHaveBeenCalledExactlyOnceWith("result");
			expect(responder.error).not.toHaveBeenCalled();
		});

		/**
		 * Asserts invalid parameters are rejected by a classic Zod schema.
		 */
		test("rejects invalid parameters with a classic Zod schema", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			const handler = vi.fn<MethodHandler<{ value: number }>>().mockReturnValue("result");
			const params = { value: "invalid" };
			const paramsSchema = zod.object({ value: zod.number() });
			dispatcher.add("method", handler, paramsSchema);

			// Act.
			await dispatcher.dispatch("method", params, responder);

			// Assert.
			expect(handler).not.toHaveBeenCalled();
			expect(responder.success).not.toHaveBeenCalled();
			expect(responder.error).toHaveBeenCalledExactlyOnceWith({
				code: JsonRpc.ErrorCode.InvalidParams,
				data: params,
				message: "Invalid method parameter(s).",
			});
		});

		/**
		 * Asserts a handler is invoked when parameters satisfy a Zod Mini schema.
		 */
		test("validates parameters with a Zod Mini schema", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			const handler = vi.fn<MethodHandler<{ value: number }>>().mockReturnValue("result");
			const params = { value: 42 };
			const paramsSchema = zodMini.object({ value: zodMini.number() });
			dispatcher.add("method", handler, paramsSchema);

			// Act.
			await dispatcher.dispatch("method", params, responder);

			// Assert.
			expect(handler).toHaveBeenCalledExactlyOnceWith(params, responder, expect.any(Function));
			expect(responder.success).toHaveBeenCalledExactlyOnceWith("result");
			expect(responder.error).not.toHaveBeenCalled();
		});

		/**
		 * Asserts invalid parameters are rejected by a Zod Mini schema.
		 */
		test("rejects invalid parameters with a Zod Mini schema", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const responder = createResponder();
			const handler = vi.fn<MethodHandler<{ value: number }>>().mockReturnValue("result");
			const params = { value: "invalid" };
			const paramsSchema = zodMini.object({ value: zodMini.number() });
			dispatcher.add("method", handler, paramsSchema);

			// Act.
			await dispatcher.dispatch("method", params, responder);

			// Assert.
			expect(handler).not.toHaveBeenCalled();
			expect(responder.success).not.toHaveBeenCalled();
			expect(responder.error).toHaveBeenCalledExactlyOnceWith({
				code: JsonRpc.ErrorCode.InvalidParams,
				data: params,
				message: "Invalid method parameter(s).",
			});
		});

		/**
		 * Asserts disposing a registration removes its handler.
		 */
		test("returns a disposable handler registration", async () => {
			// Arrange.
			const dispatcher = new MethodDispatcher();
			const handler = vi.fn<MethodHandler<JsonRpc.Parameters>>().mockReturnValue("result");
			const registration = dispatcher.add("method", handler);
			const responder = createResponder();

			// Act.
			registration.dispose();
			await dispatcher.dispatch("method", {}, responder);

			// Assert.
			expect(handler).not.toHaveBeenCalled();
			expect(responder.error).toHaveBeenCalledExactlyOnceWith({
				code: JsonRpc.ErrorCode.MethodNotFound,
				message: "No method handlers found for: method",
			});
		});
	});
});

/**
 * Creates a responder backed by mock functions.
 * @param canRespond Determines whether the responder can send a response.
 * @returns The responder.
 */
function createResponder(canRespond = true): Responder {
	return {
		canRespond,
		error: vi.fn(),
		success: vi.fn(),
	};
}
