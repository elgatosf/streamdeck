import { describe, expect, test, vi } from "vitest";

import type { RequestPool } from "../client/request-pool.js";
import type { JsonRpcConnectionOptions } from "../connection-options.js";
import * as JsonRpc from "../json-rpc/index.js";
import { MessageRouter } from "../message-router.js";
import { MessageSender } from "../message-sender.js";
import type { MethodDispatcher } from "../server/method-dispatcher.js";

describe("MessageRouter", () => {
	/**
	 * Asserts requests are dispatched with a responder capable of responding.
	 */
	test("routes requests to the server dispatcher", async () => {
		// Arrange.
		const connectionOptions: JsonRpcConnectionOptions = {
			inboundStream: createInboundStream(
				JSON.stringify({ id: "request-id", jsonrpc: "2.0", method: "method", params: { value: 42 } }),
			),
			outboundStream: new WritableStream(),
		};

		const clientPool = { resolve: vi.fn() } as unknown as RequestPool;
		const serverDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new MessageRouter(
			connectionOptions.inboundStream,
			new MessageSender(connectionOptions.outboundStream),
			clientPool,
			serverDispatcher,
		);

		// Act.
		await router.start(new AbortController().signal);

		// Assert.
		expect(serverDispatcher.dispatch).toHaveBeenCalledExactlyOnceWith(
			"method",
			{ value: 42 },
			expect.objectContaining({ canRespond: true }),
		);
		expect(clientPool.resolve).not.toHaveBeenCalled();
	});

	/**
	 * Asserts requests with falsy identifiers are not treated as notifications.
	 */
	test.each(["", 0, null])("routes requests with the identifier %j as requests", async (id) => {
		// Arrange.
		const connectionOptions: JsonRpcConnectionOptions = {
			inboundStream: createInboundStream(JSON.stringify({ id, jsonrpc: "2.0", method: "method" })),
			outboundStream: new WritableStream(),
		};

		const clientPool = { resolve: vi.fn() } as unknown as RequestPool;
		const serverDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new MessageRouter(
			connectionOptions.inboundStream,
			new MessageSender(connectionOptions.outboundStream),
			clientPool,
			serverDispatcher,
		);

		// Act.
		await router.start(new AbortController().signal);

		// Assert.
		expect(serverDispatcher.dispatch).toHaveBeenCalledExactlyOnceWith(
			"method",
			undefined,
			expect.objectContaining({ canRespond: true }),
		);
		expect(clientPool.resolve).not.toHaveBeenCalled();
	});

	/**
	 * Asserts notifications are dispatched with a responder that cannot respond.
	 */
	test("routes notifications to the server dispatcher", async () => {
		// Arrange.
		const connectionOptions: JsonRpcConnectionOptions = {
			inboundStream: createInboundStream(JSON.stringify({ jsonrpc: "2.0", method: "method" })),
			outboundStream: new WritableStream(),
		};

		const clientPool = { resolve: vi.fn() } as unknown as RequestPool;
		const serverDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new MessageRouter(
			connectionOptions.inboundStream,
			new MessageSender(connectionOptions.outboundStream),
			clientPool,
			serverDispatcher,
		);

		// Act.
		await router.start(new AbortController().signal);

		// Assert.
		expect(serverDispatcher.dispatch).toHaveBeenCalledExactlyOnceWith(
			"method",
			undefined,
			expect.objectContaining({ canRespond: false }),
		);
		expect(clientPool.resolve).not.toHaveBeenCalled();
	});

	/**
	 * Asserts responses resolve their pending request.
	 */
	test("routes responses to the client pool", async () => {
		// Arrange.
		const response: JsonRpc.Response = {
			id: "request-id",
			jsonrpc: "2.0",
			result: "result",
		};

		const connectionOptions: JsonRpcConnectionOptions = {
			inboundStream: createInboundStream(JSON.stringify(response)),
			outboundStream: new WritableStream(),
		};

		const clientPool = { resolve: vi.fn() } as unknown as RequestPool;
		const serverDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new MessageRouter(
			connectionOptions.inboundStream,
			new MessageSender(connectionOptions.outboundStream),
			clientPool,
			serverDispatcher,
		);

		// Act.
		await router.start(new AbortController().signal);

		// Assert.
		expect(clientPool.resolve).toHaveBeenCalledExactlyOnceWith(response);
		expect(serverDispatcher.dispatch).not.toHaveBeenCalled();
	});

	/**
	 * Asserts invalid messages produce a JSON-RPC parse error.
	 */
	test("responds with an error when a message cannot be parsed", async () => {
		// Arrange.
		const write = vi.fn();
		const connectionOptions: JsonRpcConnectionOptions = {
			inboundStream: createInboundStream("invalid"),
			outboundStream: new WritableStream({
				write: (value): void => write(value),
			}),
		};

		const clientPool = { resolve: vi.fn() } as unknown as RequestPool;
		const serverDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new MessageRouter(
			connectionOptions.inboundStream,
			new MessageSender(connectionOptions.outboundStream),
			clientPool,
			serverDispatcher,
		);

		// Act.
		await router.start(new AbortController().signal);

		// Assert.
		expect(write).toHaveBeenCalledExactlyOnceWith({
			error: {
				code: JsonRpc.ErrorCode.ParseError,
				data: "invalid",
				message: "Unable to parse JSON-RPC value.",
			},
			id: null,
			jsonrpc: "2.0",
		});
	});

	/**
	 * Asserts valid JSON that is not a request produces an invalid request error.
	 */
	test("responds with an invalid request error when the JSON-RPC value is invalid", async () => {
		// Arrange.
		const message = JSON.stringify({ id: 42, jsonrpc: "2.0", method: false });
		const write = vi.fn();
		const connectionOptions: JsonRpcConnectionOptions = {
			inboundStream: createInboundStream(message),
			outboundStream: new WritableStream({
				write: (value): void => write(value),
			}),
		};

		const clientPool = { resolve: vi.fn() } as unknown as RequestPool;
		const serverDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new MessageRouter(
			connectionOptions.inboundStream,
			new MessageSender(connectionOptions.outboundStream),
			clientPool,
			serverDispatcher,
		);

		// Act.
		await router.start(new AbortController().signal);

		// Assert.
		expect(write).toHaveBeenCalledExactlyOnceWith({
			error: {
				code: JsonRpc.ErrorCode.InvalidRequest,
				data: message,
				message: "Invalid JSON-RPC request.",
			},
			id: 42,
			jsonrpc: "2.0",
		});
	});

	/**
	 * Asserts a response without an identifier produces an invalid request error.
	 */
	test("responds with an invalid request error when a response has no identifier", async () => {
		// Arrange.
		const message = JSON.stringify({ jsonrpc: "2.0", result: "result" });
		const write = vi.fn();
		const connectionOptions: JsonRpcConnectionOptions = {
			inboundStream: createInboundStream(message),
			outboundStream: new WritableStream({
				write: (value): void => write(value),
			}),
		};

		const clientPool = { resolve: vi.fn() } as unknown as RequestPool;
		const serverDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new MessageRouter(
			connectionOptions.inboundStream,
			new MessageSender(connectionOptions.outboundStream),
			clientPool,
			serverDispatcher,
		);

		// Act.
		await router.start(new AbortController().signal);

		// Assert.
		expect(write).toHaveBeenCalledExactlyOnceWith({
			error: {
				code: JsonRpc.ErrorCode.InvalidRequest,
				data: message,
				message: "Invalid JSON-RPC request.",
			},
			id: null,
			jsonrpc: "2.0",
		});
		expect(clientPool.resolve).not.toHaveBeenCalled();
		expect(serverDispatcher.dispatch).not.toHaveBeenCalled();
	});

	/**
	 * Asserts routing continues as values arrive until the inbound stream closes.
	 */
	test("continues routing until the inbound stream closes", async () => {
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

		const clientPool = { resolve: vi.fn() } as unknown as RequestPool;
		const serverDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new MessageRouter(
			connectionOptions.inboundStream,
			new MessageSender(connectionOptions.outboundStream),
			clientPool,
			serverDispatcher,
		);
		const routing = router.start();

		// Act.
		inboundController?.enqueue(JSON.stringify({ jsonrpc: "2.0", method: "first" }));
		await vi.waitFor(() => expect(serverDispatcher.dispatch).toHaveBeenCalledTimes(1));

		inboundController?.enqueue(JSON.stringify({ jsonrpc: "2.0", method: "second" }));
		inboundController?.close();
		await routing;

		// Assert.
		expect(serverDispatcher.dispatch).toHaveBeenNthCalledWith(
			1,
			"first",
			undefined,
			expect.objectContaining({ canRespond: false }),
		);
		expect(serverDispatcher.dispatch).toHaveBeenNthCalledWith(
			2,
			"second",
			undefined,
			expect.objectContaining({ canRespond: false }),
		);
		expect(connectionOptions.inboundStream.locked).toBe(false);
	});

	/**
	 * Asserts the inbound stream lock is released after observation completes.
	 */
	test("releases the inbound stream reader", async () => {
		// Arrange.
		const connectionOptions: JsonRpcConnectionOptions = {
			inboundStream: createInboundStream(),
			outboundStream: new WritableStream(),
		};
		const clientPool = { resolve: vi.fn() } as unknown as RequestPool;
		const serverDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new MessageRouter(
			connectionOptions.inboundStream,
			new MessageSender(connectionOptions.outboundStream),
			clientPool,
			serverDispatcher,
		);

		// Act.
		await router.start(new AbortController().signal);

		// Assert.
		expect(connectionOptions.inboundStream.locked).toBe(false);
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
