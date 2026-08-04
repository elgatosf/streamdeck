import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IDisposable } from "../../explicit-resource-management/disposable.js";
import { RpcClient } from "../client.js";
import { createRpcServerClient } from "../server-client.js";
import { RpcServer } from "../server.js";

vi.mock("../client.js");
vi.mock("../server.js");

/**
 * Describes {@link createRpcServerClient}.
 */
describe("createRpcServerClient", () => {
	beforeEach(() => vi.clearAllMocks());

	/**
	 * Asserts the server and client attempt to receive a message in order.
	 */
	it("propagates receiving message", async () => {
		// Arrange.
		const clientSpy = vi.spyOn(RpcClient.prototype, "receive");
		const serverSpy = vi.spyOn(RpcServer.prototype, "receive");
		const serverClient = createRpcServerClient(vi.fn());

		// Act.
		await serverClient.receive("foo");

		// Assert.
		expect(clientSpy).toHaveBeenCalledExactlyOnceWith("foo");
		expect(serverSpy).toHaveBeenCalledExactlyOnceWith("foo");
		expect(clientSpy).toHaveBeenCalledBefore(serverSpy);
	});

	/**
	 * Asserts a successful client parse returns true.
	 */
	it("returns success if the client can receive", async () => {
		// Arrange.
		const clientSpy = vi.spyOn(RpcClient.prototype, "receive").mockReturnValue(Promise.resolve(true));
		const serverSpy = vi.spyOn(RpcServer.prototype, "receive").mockReturnValue(Promise.resolve(false));
		const serverClient = createRpcServerClient(vi.fn());

		// Act.
		const success = await serverClient.receive("foo");

		// Assert.
		expect(success).toBe(true);
		expect(clientSpy).toHaveBeenCalledExactlyOnceWith("foo");
		expect(serverSpy).not.toHaveBeenCalled();
	});

	/**
	 * Asserts a successful server parse returns true.
	 */
	it("returns success if the server can receive", async () => {
		// Arrange.
		const clientSpy = vi.spyOn(RpcClient.prototype, "receive").mockReturnValue(Promise.resolve(false));
		const serverSpy = vi.spyOn(RpcServer.prototype, "receive").mockReturnValue(Promise.resolve(true));
		const serverClient = createRpcServerClient(vi.fn());

		// Act.
		const success = await serverClient.receive("foo");

		// Assert.
		expect(success).toBe(true);
		expect(clientSpy).toHaveBeenCalledExactlyOnceWith("foo");
		expect(serverSpy).toHaveBeenCalledExactlyOnceWith("foo");
	});

	/**
	 * Asserts the server-client can add methods to the server.
	 */
	it("can add", () => {
		// Arrange.
		const disposable = vi.fn();
		const serverSpy = vi.spyOn(RpcServer.prototype, "addMethod").mockReturnValue(disposable as unknown as IDisposable);
		const serverClient = createRpcServerClient(vi.fn());

		// Act.
		const handler = vi.fn();
		const res = serverClient.addMethod("test", handler);

		// Assert.
		expect(serverSpy).toHaveBeenCalledExactlyOnceWith<[string, () => void]>("test", handler);
		expect(res).toBe(disposable);
	});

	/**
	 * Asserts the server-client can send notifications.
	 */
	it("can notify", () => {
		// Arrange.
		const clientSpy = vi.spyOn(RpcClient.prototype, "notify");
		const serverClient = createRpcServerClient(vi.fn());

		// Act.
		serverClient.notify({ method: "one" });
		serverClient.notify("two", {
			name: "Elgato",
		});

		// Assert.
		expect(clientSpy).toHaveBeenNthCalledWith(1, { method: "one" });
		expect(clientSpy).toHaveBeenNthCalledWith(2, "two", { name: "Elgato" });
	});

	/**
	 * Asserts the server-client can send requests.
	 */
	it("can request", () => {
		// Arrange.
		const clientSpy = vi.spyOn(RpcClient.prototype, "request");
		const serverClient = createRpcServerClient(vi.fn());

		// Act.
		serverClient.request({ method: "one" });
		serverClient.request("two", {
			name: "Elgato",
		});

		// Assert.
		expect(clientSpy).toHaveBeenNthCalledWith(1, { method: "one" });
		expect(clientSpy).toHaveBeenNthCalledWith(2, "two", { name: "Elgato" });
	});
});
