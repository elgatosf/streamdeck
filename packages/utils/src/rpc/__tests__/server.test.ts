import { describe, expect, it, vi } from "vitest";

import {
	JsonRpcErrorCode,
	type JsonRpcErrorResponse,
	type JsonRpcRequest,
	JsonRpcResponse,
	RpcServer,
} from "../index.js";

/**
 * Describes {@link RpcServer}.
 */
describe("RpcServer", () => {
	/**
	 * Asserts an server correctly handles unexpected data structures.
	 */
	it("ignores unknown payloads", async () => {
		// Arrange.
		const sender = vi.fn();
		const server = new RpcServer(sender);

		// Act.
		const result = await server.receive(true);

		// Assert.
		expect(result).toBe(false);
		expect(sender).toHaveBeenCalledTimes(0);
	});

	/**
	 * Asserts an server returns an error for unknown methods.
	 */
	it("responds with an error for unknown methods", async () => {
		// Arrange.
		const sender = vi.fn();
		const server = new RpcServer(sender);

		// Act.
		await server.receive({
			jsonrpc: "2.0",
			id: "123",
			method: "test",
		} satisfies JsonRpcRequest);

		// Assert.
		expect(sender).toHaveBeenCalledExactlyOnceWith<[JsonRpcErrorResponse]>({
			jsonrpc: "2.0",
			id: "123",
			error: {
				code: JsonRpcErrorCode.MethodNotFound,
				message: "The method does not exist or is not available.",
			},
		});
	});

	/**
	 * Asserts methods can be chained.
	 */
	it("methods can be chained", async () => {
		// Arrange.
		const sender = vi.fn();
		const server = new RpcServer(sender);

		// Act.
		server.addMethod("test", (req, res, next) => next());
		server.addMethod("test", () => "Hello world");
		await server.receive({
			jsonrpc: "2.0",
			method: "test",
			id: "123",
		} satisfies JsonRpcRequest);

		// Assert.
		expect(sender).toHaveBeenCalledExactlyOnceWith<[JsonRpcResponse]>({
			jsonrpc: "2.0",
			id: "123",
			result: "Hello world",
		});
	});

	/**
	 * Asserts methods resolve to null when no result is return.
	 */
	it("methods defaults to null", async () => {
		// Arrange.
		const sender = vi.fn();
		const server = new RpcServer(sender);

		// Act.
		server.addMethod("test", (req, res, next) => next());
		server.addMethod("test", () => {
			/* do nothing */
		});
		await server.receive({
			jsonrpc: "2.0",
			method: "test",
			id: "123",
		} satisfies JsonRpcRequest);

		// Assert.
		expect(sender).toHaveBeenCalledExactlyOnceWith<[JsonRpcResponse]>({
			jsonrpc: "2.0",
			id: "123",
			result: null,
		});
	});

	/**
	 * Asserts methods resolve to null when there is no next.
	 */
	it("methods defaults to null when there is no next", async () => {
		// Arrange.
		const sender = vi.fn();
		const server = new RpcServer(sender);

		// Act.
		server.addMethod("test", (req, res, next) => next());
		server.addMethod("test", (req, res, next) => next());
		await server.receive({
			jsonrpc: "2.0",
			method: "test",
			id: "123",
		} satisfies JsonRpcRequest);

		// Assert.
		expect(sender).toHaveBeenCalledExactlyOnceWith<[JsonRpcResponse]>({
			jsonrpc: "2.0",
			id: "123",
			result: null,
		});
	});

	/**
	 * Asserts the disposable of a method removes the method.
	 */
	it("can remove methods", async () => {
		// Arrange.
		const sender = vi.fn();
		const listener = vi.fn();
		const server = new RpcServer(sender);
		const req: JsonRpcRequest = {
			jsonrpc: "2.0",
			method: "/test",
		};

		const disposable = server.addMethod("/test", listener);

		// Act, assert.
		await server.receive(req);
		expect(listener).toHaveBeenCalledTimes(1);

		// Act, assert (dispose).
		disposable.dispose();
		await server.receive(req);
		expect(listener).toHaveBeenCalledTimes(1); // Should still be 1.
	});

	/**
	 * Asserts the server provides the parameters from the request.
	 */
	it("provides parameters", async () => {
		// Arrange.
		const listener = vi.fn();
		const server = new RpcServer(vi.fn());

		// Act.
		server.addMethod("/test", ({ name }: MockParameters) => {
			listener(name);
		});

		await server.receive({
			jsonrpc: "2.0",
			method: "/test",
			params: {
				name: "Elgato",
			},
		} satisfies JsonRpcRequest);

		// Assert.
		expect(listener).toHaveBeenCalledExactlyOnceWith("Elgato");
	});

	/**
	 * Asserts the server returns the result of the handler.
	 */
	it("returns the result", async () => {
		// Arrange.
		const sender = vi.fn();
		const server = new RpcServer(sender);

		// Act.
		server.addMethod("test", () => "Hello world");
		await server.receive({
			jsonrpc: "2.0",
			method: "test",
			id: "123",
		} satisfies JsonRpcRequest);

		// Assert
		expect(sender).toHaveBeenCalledExactlyOnceWith<[JsonRpcResponse]>({
			jsonrpc: "2.0",
			id: "123",
			result: "Hello world",
		});
	});

	/**
	 * Asserts the server returns null result for method handlers that have no result.
	 */
	it("returns null when no result", async () => {
		// Arrange.
		const sender = vi.fn();
		const server = new RpcServer(sender);

		// Act.
		server.addMethod("test", () => {
			/* no result */
		});
		await server.receive({
			jsonrpc: "2.0",
			method: "test",
			id: "123",
		} satisfies JsonRpcRequest);

		// Assert
		expect(sender).toHaveBeenCalledExactlyOnceWith<[JsonRpcResponse]>({
			jsonrpc: "2.0",
			id: "123",
			result: null,
		});
	});

	/**
	 * Asserts the server returns an error for thrown errors
	 */
	it("returns an error for thrown errors", async () => {
		// Arrange.
		const sender = vi.fn();
		const server = new RpcServer(sender);

		// Act.
		server.addMethod("err", () => {
			throw new Error("Something went wrong");
		});

		await expect(
			server.receive({
				jsonrpc: "2.0",
				method: "err",
				id: "123",
			} satisfies JsonRpcRequest),
		).rejects.toEqual(new Error("Something went wrong"));

		// Assert
		expect(sender).toHaveBeenCalledExactlyOnceWith<[JsonRpcResponse]>({
			jsonrpc: "2.0",
			id: "123",
			error: {
				code: JsonRpcErrorCode.InternalError,
				message: "Something went wrong",
			},
		});
	});
});

type MockParameters = {
	name: string;
};
