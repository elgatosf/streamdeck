import { afterEach, describe, expect, expectTypeOf, test, vi } from "vitest";

import type { JsonRpcConnectionOptions } from "../connection-options.js";
import { JsonRpcConnection } from "../connection.js";
import * as JsonRpc from "../json-rpc/index.js";
import type { MethodDispatcher } from "../server/method-dispatcher.js";

const requestId = "00000000-0000-4000-8000-000000000000";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("JsonRpcConnection", () => {
	/**
	 * Provides assertions for `notify(...)`.
	 */
	describe("notify", () => {
		/**
		 * Asserts concurrent notifications are written sequentially.
		 */
		test("serializes concurrent notifications", async () => {
			// Arrange.
			let completeFirstWrite: (() => void) | undefined;
			const firstWrite = new Promise<void>((resolve) => {
				completeFirstWrite = resolve;
			});
			const write = vi.fn().mockReturnValueOnce(firstWrite).mockResolvedValueOnce(undefined);
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: createInboundStream(),
				outboundStream: new WritableStream({ write }),
			};
			const connection = new JsonRpcConnection(connectionOptions);

			// Act.
			const firstNotification = connection.notify("first");
			const secondNotification = connection.notify("second");
			await Promise.resolve();

			// Assert.
			expect(write).toHaveBeenCalledOnce();
			completeFirstWrite?.();
			await Promise.all([firstNotification, secondNotification]);
			expect(write).toHaveBeenNthCalledWith(1, expect.objectContaining({ method: "first" }), expect.anything());
			expect(write).toHaveBeenNthCalledWith(2, expect.objectContaining({ method: "second" }), expect.anything());
		});

		/**
		 * Asserts a method name and parameters are sent as a notification.
		 */
		test("sends a notification from a method name", async () => {
			// Arrange.
			const write = vi.fn();
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: createInboundStream(),
				outboundStream: new WritableStream({ write: (value): void => write(value) }),
			};
			const connection = new JsonRpcConnection(connectionOptions);

			// Act.
			await connection.notify("method", { value: 42 });

			// Assert.
			expect(write).toHaveBeenCalledExactlyOnceWith({
				jsonrpc: "2.0",
				method: "method",
				params: { value: 42 },
			});
		});

		/**
		 * Asserts omitted parameters are not included in the notification.
		 */
		test("omits undefined notification parameters", async () => {
			// Arrange.
			const write = vi.fn();
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: createInboundStream(),
				outboundStream: new WritableStream({ write: (value): void => write(value) }),
			};
			const connection = new JsonRpcConnection(connectionOptions);

			// Act.
			await connection.notify("method");

			// Assert.
			expect(write).toHaveBeenCalledExactlyOnceWith({
				jsonrpc: "2.0",
				method: "method",
			});
		});

		/**
		 * Asserts a request object is sent as a notification without request-only options.
		 */
		test("sends a notification from a request", async () => {
			// Arrange.
			const write = vi.fn();
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: createInboundStream(),
				outboundStream: new WritableStream({ write: (value): void => write(value) }),
			};
			const connection = new JsonRpcConnection(connectionOptions);

			// Act.
			await connection.notify({ method: "method", params: [42], timeout: 100 });

			// Assert.
			expect(write).toHaveBeenCalledExactlyOnceWith({
				jsonrpc: "2.0",
				method: "method",
				params: [42],
			});
		});
	});

	/**
	 * Provides assertions for `request(...)`.
	 */
	describe("request", () => {
		/**
		 * Asserts a request resolves with its successful inbound response.
		 */
		test("resolves a successful request", async () => {
			// Arrange.
			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);
			let inboundController: ReadableStreamDefaultController<string> | undefined;
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: new ReadableStream({
					start: (controller): void => {
						inboundController = controller;
					},
				}),
				outboundStream: new WritableStream({
					write: (): void => {
						inboundController?.enqueue(JSON.stringify({ id: requestId, jsonrpc: "2.0", result: "result" }));
						inboundController?.close();
					},
				}),
			};

			const connection = new JsonRpcConnection(connectionOptions);
			const connected = connection.connect();

			// Act.
			const response = await connection.request("method", { value: 42 });
			await connected;

			// Assert.
			expect(response).toEqual({ ok: true, result: "result" });
		});

		/**
		 * Asserts a request resolves with its inbound error response.
		 */
		test("resolves a failed request", async () => {
			// Arrange.
			vi.spyOn(crypto, "randomUUID").mockReturnValue(requestId);
			const error: JsonRpc.Error = {
				code: JsonRpc.ErrorCode.InternalError,
				data: null,
				message: "Internal error",
			};
			let inboundController: ReadableStreamDefaultController<string> | undefined;
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: new ReadableStream({
					start: (controller): void => {
						inboundController = controller;
					},
				}),
				outboundStream: new WritableStream({
					write: (): void => {
						inboundController?.enqueue(JSON.stringify({ error, id: requestId, jsonrpc: "2.0" }));
						inboundController?.close();
					},
				}),
			};

			const connection = new JsonRpcConnection(connectionOptions);
			const connected = connection.connect(new AbortController().signal);

			// Act.
			const response = await connection.request({ method: "method" });
			await connected;

			// Assert.
			expect(response).toEqual({ error, ok: false });
		});
	});

	/**
	 * Provides assertions for `addLocalMethod(method, handler)`.
	 */
	describe("addLocalMethod", () => {
		/**
		 * Asserts the method signature matches {@link MethodDispatcher.add}.
		 */
		test("matches the method dispatcher signature", () => {
			// Arrange.
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: createInboundStream(),
				outboundStream: new WritableStream(),
			};
			const connection = new JsonRpcConnection(connectionOptions);

			// Act, assert.
			expectTypeOf(connection.addLocalMethod).toEqualTypeOf<MethodDispatcher["add"]>();
		});

		/**
		 * Asserts inbound requests are routed to a local method handler.
		 */
		test("handles an inbound request", async () => {
			// Arrange.
			const write = vi.fn();
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: createInboundStream(
					JSON.stringify({ id: requestId, jsonrpc: "2.0", method: "method", params: { value: 42 } }),
				),
				outboundStream: new WritableStream({ write: (value): void => write(value) }),
			};

			const connection = new JsonRpcConnection(connectionOptions);
			const handler = vi.fn().mockReturnValue("result");
			connection.addLocalMethod("method", handler);

			// Act.
			await connection.connect(new AbortController().signal);

			// Assert.
			expect(handler).toHaveBeenCalledExactlyOnceWith(
				{ value: 42 },
				expect.objectContaining({ canRespond: false }),
				expect.any(Function),
			);
			expect(write).toHaveBeenCalledExactlyOnceWith({
				id: requestId,
				jsonrpc: "2.0",
				result: "result",
			});
		});

		/**
		 * Asserts disposing a local method registration removes its handler.
		 */
		test("removes a disposed local method", async () => {
			// Arrange.
			const write = vi.fn();
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: createInboundStream(JSON.stringify({ id: requestId, jsonrpc: "2.0", method: "method" })),
				outboundStream: new WritableStream({ write: (value): void => write(value) }),
			};

			const connection = new JsonRpcConnection(connectionOptions);
			const handler = vi.fn().mockReturnValue("result");
			const registration = connection.addLocalMethod("method", handler);
			registration.dispose();

			// Act.
			await connection.connect(new AbortController().signal);

			// Assert.
			expect(handler).not.toHaveBeenCalled();
			expect(write).toHaveBeenCalledExactlyOnceWith({
				error: {
					code: JsonRpc.ErrorCode.MethodNotFound,
					message: "No method handlers found for: method",
				},
				id: requestId,
				jsonrpc: "2.0",
			});
		});
	});

	/**
	 * Provides assertions for `connect(signal)`.
	 */
	describe("connect", () => {
		/**
		 * Asserts a connection completes when its inbound stream closes.
		 */
		test("completes when the inbound stream closes", async () => {
			// Arrange.
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: createInboundStream(),
				outboundStream: new WritableStream(),
			};

			const connection = new JsonRpcConnection(connectionOptions);

			// Act, assert.
			await expect(connection.connect()).resolves.toBeUndefined();
		});

		/**
		 * Asserts a routing failure does not leave the connection active.
		 */
		test("can reconnect after the inbound stream errors", async () => {
			// Arrange.
			const error = new Error("Inbound stream failed");
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: new ReadableStream({
					start: (controller): void => controller.error(error),
				}),
				outboundStream: new WritableStream(),
			};

			const connection = new JsonRpcConnection(connectionOptions);

			// Act, assert.
			await expect(connection.connect()).rejects.toBe(error);
			await expect(connection.connect()).rejects.toBe(error);
		});

		/**
		 * Asserts an active connection cannot be connected again.
		 */
		test("rejects a concurrent connection", async () => {
			// Arrange.
			let inboundController: ReadableStreamDefaultController<string> | undefined;
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream: new ReadableStream({
					start: (controller): void => {
						inboundController = controller;
					},
				}),
				outboundStream: new WritableStream(),
			};

			const connection = new JsonRpcConnection(connectionOptions);
			const connected = connection.connect(new AbortController().signal);

			// Act, assert.
			await expect(connection.connect()).rejects.toThrowError("JSON-RPC connection is already connected.");

			// Clean-up.
			inboundController?.close();
			await connected;
		});

		/**
		 * Asserts aborting a connection rejects with the abort reason and releases the inbound stream.
		 */
		test("rejects when aborted", async () => {
			// Arrange.
			const inboundStream = new ReadableStream<string>();
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream,
				outboundStream: new WritableStream(),
			};

			const connection = new JsonRpcConnection(connectionOptions);
			const abortController = new AbortController();
			const connected = connection.connect(abortController.signal);

			// Act.
			abortController.abort();

			// Assert.
			await expect(connected).rejects.toBe(abortController.signal.reason);
			expect(inboundStream.locked).toBe(false);
		});

		/**
		 * Asserts an already-aborted signal rejects without locking the inbound stream.
		 */
		test("rejects with an already-aborted signal", async () => {
			// Arrange.
			const inboundStream = new ReadableStream<string>();
			const connectionOptions: JsonRpcConnectionOptions = {
				inboundStream,
				outboundStream: new WritableStream(),
			};

			const connection = new JsonRpcConnection(connectionOptions);
			const abortController = new AbortController();
			abortController.abort();

			// Act, assert.
			await expect(connection.connect(abortController.signal)).rejects.toBe(abortController.signal.reason);
			expect(inboundStream.locked).toBe(false);
		});
	});
});

/**
 * Creates a closed inbound stream containing the specified values.
 * @param values Values to add to the stream.
 * @returns The inbound stream.
 */
function createInboundStream(...values: string[]): ReadableStream<string> {
	return new ReadableStream({
		start(controller): void {
			values.forEach((value) => controller.enqueue(value));
			controller.close();
		},
	});
}
