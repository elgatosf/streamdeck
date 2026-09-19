import { describe, expect, test, vi } from "vitest";

import type { RequestPool } from "../client/request-pool.js";
import type { JsonRpcConnectionOptions } from "../connection-options.js";
import { InboundMessageRouter } from "../inbound-message-router.js";
import * as JsonRpc from "../json-rpc/index.js";
import type { MethodDispatcher } from "../server/method-dispatcher.js";

describe("InboundMessageRouter", () => {
	/**
	 * Asserts requests are dispatched with a responder capable of responding.
	 */
	test("routes requests to the request dispatcher", async () => {
		// Arrange.
		const connectionOptions: JsonRpcConnectionOptions = {
			inboundStream: createInboundStream(
				JSON.stringify({ id: "request-id", jsonrpc: "2.0", method: "method", params: { value: 42 } }),
			),
			outboundStream: new WritableStream(),
		};

		const requestPool = { resolve: vi.fn() } as unknown as RequestPool;
		const requestDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new InboundMessageRouter(connectionOptions, requestPool, requestDispatcher);

		// Act.
		await router.start(new AbortController().signal);

		// Assert.
		expect(requestDispatcher.dispatch).toHaveBeenCalledExactlyOnceWith(
			"method",
			{ value: 42 },
			expect.objectContaining({ canRespond: true }),
		);
		expect(requestPool.resolve).not.toHaveBeenCalled();
	});

	/**
	 * Asserts notifications are dispatched with a responder that cannot respond.
	 */
	test("routes notifications to the request dispatcher", async () => {
		// Arrange.
		const connectionOptions: JsonRpcConnectionOptions = {
			inboundStream: createInboundStream(JSON.stringify({ jsonrpc: "2.0", method: "method" })),
			outboundStream: new WritableStream(),
		};

		const requestPool = { resolve: vi.fn() } as unknown as RequestPool;
		const requestDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new InboundMessageRouter(connectionOptions, requestPool, requestDispatcher);

		// Act.
		await router.start(new AbortController().signal);

		// Assert.
		expect(requestDispatcher.dispatch).toHaveBeenCalledExactlyOnceWith(
			"method",
			undefined,
			expect.objectContaining({ canRespond: false }),
		);
		expect(requestPool.resolve).not.toHaveBeenCalled();
	});

	/**
	 * Asserts responses resolve their pending request.
	 */
	test("routes responses to the request pool", async () => {
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

		const requestPool = { resolve: vi.fn() } as unknown as RequestPool;
		const requestDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new InboundMessageRouter(connectionOptions, requestPool, requestDispatcher);

		// Act.
		await router.start(new AbortController().signal);

		// Assert.
		expect(requestPool.resolve).toHaveBeenCalledExactlyOnceWith(response);
		expect(requestDispatcher.dispatch).not.toHaveBeenCalled();
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

		const requestPool = { resolve: vi.fn() } as unknown as RequestPool;
		const requestDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new InboundMessageRouter(connectionOptions, requestPool, requestDispatcher);

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
	 * Asserts the inbound stream lock is released after observation completes.
	 */
	test("releases the inbound stream reader", async () => {
		// Arrange.
		const connectionOptions: JsonRpcConnectionOptions = {
			inboundStream: createInboundStream(),
			outboundStream: new WritableStream(),
		};
		const requestPool = { resolve: vi.fn() } as unknown as RequestPool;
		const requestDispatcher = { dispatch: vi.fn() } as unknown as MethodDispatcher;
		const router = new InboundMessageRouter(connectionOptions, requestPool, requestDispatcher);

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
