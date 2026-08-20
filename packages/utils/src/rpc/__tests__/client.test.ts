import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	JsonRpcErrorCode,
	JsonRpcErrorResponse,
	type JsonRpcRequest,
	type JsonRpcResponse,
	RpcClient,
	type RpcErrorResponse,
	type RpcSender,
} from "../index.js";

/**
 * Describes {@link RpcClient}.
 */
describe("RpcClient", () => {
	let sender: RpcSender;
	let client: RpcClient;

	/**
	 * Configure a mock response for requests.
	 */
	beforeEach(() => {
		sender = vi.fn(({ id, method }: JsonRpcRequest) => {
			if (!id) {
				return true;
			}

			switch (method) {
				case "err":
					client.receive({
						jsonrpc: "2.0",
						error: {
							code: 1,
							message: "Something went wrong",
						},
						id,
					} satisfies JsonRpcResponse);
					break;
				case "test":
					client.receive({
						jsonrpc: "2.0",
						result: "Hello world",
						id,
					} satisfies JsonRpcResponse);
					break;
			}

			return true;
		}) as unknown as RpcSender;

		client = new RpcClient(sender);
	});

	/**
	 * Asserts invalid JSON-RPC values return an appropriate success value.
	 */
	it("ignores non JSON-RPC values", async () => {
		// Arrange, act, assert.
		const success = await client.receive("foo");
		expect(success).toBe(false);
	});

	/**
	 * Asserts notifications can be sent as method and params.
	 */
	it("sends notifications as method and params", async () => {
		// Arrange, act
		await client.notify("test", {
			name: "Elgato",
		});

		// Assert.
		expect(sender).toHaveBeenCalledExactlyOnceWith<[JsonRpcRequest]>({
			jsonrpc: "2.0",
			method: "test",
			id: undefined,
			params: {
				name: "Elgato",
			},
		});
	});

	/**
	 * Asserts notifications can be sent as options.
	 */
	it("sends notifications as options", async () => {
		// Arrange, act
		await client.notify({
			method: "test",
			params: {
				name: "Elgato",
			},
		});

		// Assert.
		expect(sender).toHaveBeenCalledExactlyOnceWith<[JsonRpcRequest]>({
			jsonrpc: "2.0",
			method: "test",
			id: undefined,
			params: {
				name: "Elgato",
			},
		});
	});

	/**
	 * Asserts requests can be sent as method and parameters.
	 */
	it("sends requests as method and params", async () => {
		// Arrange, act
		const res = await client.request("test", {
			name: "Elgato",
		});

		// Assert.
		expect(sender).toHaveBeenCalledExactlyOnceWith<[JsonRpcRequest]>({
			jsonrpc: "2.0",
			method: "test",
			id: expect.any(String),
			params: {
				name: "Elgato",
			},
		});

		expect(res.ok).toBe(true);
		if (res.ok) {
			expect(res.result).toBe("Hello world");
		}
	});

	/**
	 * Asserts requests can be sent as options.
	 */
	it("sends requests as options", async () => {
		// Arrange, act
		const res = await client.request({
			method: "test",
			params: {
				name: "Elgato",
			},
		});

		// Assert.
		expect(sender).toHaveBeenCalledExactlyOnceWith<[JsonRpcRequest]>({
			jsonrpc: "2.0",
			method: "test",
			id: expect.any(String),
			params: {
				name: "Elgato",
			},
		});

		expect(res.ok).toBe(true);
		if (res.ok) {
			expect(res.result).toBe("Hello world");
		}
	});

	/**
	 * Asserts the timeout monitor is correctly configured.
	 */
	describe("timeout", () => {
		it("has a default", async () => {
			// Arrange.
			vi.spyOn(globalThis, "setTimeout");

			// Act.
			await client.request("test");
			await client.request({
				method: "test",
				params: {
					name: "Elgato",
				},
			});

			// Assert.
			expect(setTimeout).toHaveBeenCalledTimes(2);
			expect(setTimeout).toHaveBeenNthCalledWith<Parameters<typeof setTimeout>>(1, expect.any(Function), 30000);
			expect(setTimeout).toHaveBeenNthCalledWith<Parameters<typeof setTimeout>>(2, expect.any(Function), 30000);
		});

		it("uses specified timeout", async () => {
			// Arrange.
			vi.spyOn(globalThis, "setTimeout");

			// Act.
			await client.request({
				method: "test",
				params: {
					name: "Elgato",
				},
				timeout: 1,
			});

			// Assert.
			expect(setTimeout).toHaveBeenCalledExactlyOnceWith<Parameters<typeof setTimeout>>(expect.any(Function), 1);
		});
	});

	/**
	 * Asserts errors are appropriately mapped from a response.
	 */
	it("maps errors", async () => {
		// Arrange, act.
		const res = await client.request("err");

		// Assert.
		expect(res.ok).toBe(false);
		if (!res.ok) {
			expect(res.error.code).toBe(1);
			expect(res.error.message).toBe("Something went wrong");
		}
	});

	/**
	 * Asserts requests can time out.
	 */
	it("can timeout", async () => {
		const res = await client.request({
			method: "timeout",
			timeout: 1,
		});

		expect(res.ok).toBe(false);
		if (!res.ok) {
			expect(res.error.code).toBe(JsonRpcErrorCode.InternalError);
			expect(res.error.message).toBe("The request timed out.");
		}
	});

	/**
	 * Asserts unidentified responses are emitted as an event.
	 */
	it("emits unidentifiedResponse for unknown responses", async () => {
		// Arrange.
		const error = vi.fn();
		const client = new RpcClient(vi.fn(), { error });

		// Act.
		await client.receive({
			jsonrpc: "2.0",
			error: {
				code: 1,
				message: "Something went wrong",
			},
		} satisfies JsonRpcErrorResponse);

		// Assert.
		expect(error).toHaveBeenCalledExactlyOnceWith<[RpcErrorResponse]>({
			ok: false,
			error: {
				code: 1,
				message: "Something went wrong",
			},
		});
	});
});
