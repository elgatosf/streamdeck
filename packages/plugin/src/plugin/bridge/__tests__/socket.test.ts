import { type JsonValue, withResolvers } from "@elgato/utils";
import type { RpcSender } from "@elgato/utils/rpc";
import { createConnection, type Socket } from "node:net";
import { platform } from "node:os";
import { access } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { WillAppear } from "../../../api/index.js";
import { getPipePath } from "../pipe-path.js";

vi.mock("../../connection.js");
vi.mock("../../common/utils.js", async () => {
	const actual = await vi.importActual<typeof import("../../common/utils.js")>("../../common/utils.js");

	return {
		...actual,
		isDebugMode: vi.fn().mockReturnValue(true),
	};
});
vi.mock("../../manifest.js");
vi.mock("../../logging/index.js");

const pipePath = getPipePath("com.elgato.test");

describe("bridge socket", () => {
	let bridge: Awaited<typeof import("../adapter.js")>["bridge"];
	let connection: Awaited<typeof import("../../connection.js")>["connection"];
	let socket: Awaited<typeof import("../socket.js")>["socket"];

	beforeEach(async () => {
		vi.resetModules();
		({ bridge } = await import("../adapter.js"));
		({ connection } = await import("../../connection.js"));
		({ socket } = await import("../socket.js"));
	});

	afterEach(async () => {
		await socket.stop();
		vi.clearAllMocks();
	});

	it("serves snapshot requests over the debug socket", async () => {
		await bridge.start();
		const client = await connect();

		const response = await getSnapshot(client);
		expect(JSON.parse(response)).toEqual({
			id: "request-1",
			jsonrpc: "2.0",
			result: bridge.getSnapshot(),
		});

		client.destroy();
	});

	it("forwards snapshot change notifications to the connected client", async () => {
		await bridge.start();
		const client = await connect();

		const notification = receive(client);
		connection.emit("willAppear", createKeyWillAppear());

		expect(JSON.parse(await notification)).toEqual({
			jsonrpc: "2.0",
			method: "streamDeck.bridge.snapshotChanged",
			params: bridge.getSnapshot(),
		});

		client.destroy();
	});

	it("rebinds the RPC host for an active socket when started again", async () => {
		await bridge.start();
		const client = await connect();
		let send: RpcSender | undefined;

		await socket.start(
			{
				attachRpc: (nextSend) => {
					send = nextSend;
				},
				receive: async (value: JsonValue) => {
					const id = getRequestId(value);
					if (!id || !send) {
						return false;
					}

					await send({
						id,
						jsonrpc: "2.0",
						result: "rebound",
					});
					return true;
				},
			},
			"com.elgato.test",
		);

		const response = receive(client);
		client.write(
			`${JSON.stringify({
				id: "request-1",
				jsonrpc: "2.0",
				method: "test.rebound",
			})}\n`,
		);

		expect(JSON.parse(await response)).toEqual({
			id: "request-1",
			jsonrpc: "2.0",
			result: "rebound",
		});

		client.destroy();
	});

	it("removes the socket file when stopped", async () => {
		await bridge.start();
		if (platform() !== "win32") {
			await expect(access(pipePath)).resolves.toBeUndefined();
		}

		await socket.stop();
		if (platform() !== "win32") {
			await expect(access(pipePath)).rejects.toThrow();
		}
	});
});

/**
 * Creates a visible key instance event.
 * @returns Will-appear event for a key.
 */
function createKeyWillAppear(): WillAppear<{ count: number }> {
	return {
		action: "com.elgato.test.key",
		context: "ctx_001",
		device: "DEV1",
		event: "willAppear",
		payload: {
			controller: "Keypad",
			coordinates: {
				column: 2,
				row: 3,
			},
			isInMultiAction: false,
			resources: {},
			settings: {
				count: 42,
			},
		},
	};
}

/**
 * Connects a client to the debug socket.
 * @returns Connected socket client.
 */
async function connect(): Promise<Socket> {
	const client = createConnection(pipePath);
	client.setEncoding("utf-8");

	const opened = withResolvers<void>();
	client.once("connect", () => opened.resolve());
	client.once("error", (err) => opened.reject(err));
	await opened.promise;

	return client;
}

/**
 * Requests a snapshot over the socket client.
 * @param client Socket client.
 * @returns JSON-RPC response message.
 */
function getSnapshot(client: Socket): Promise<string> {
	const response = receive(client);
	client.write(
		`${JSON.stringify({
			id: "request-1",
			jsonrpc: "2.0",
			method: "streamDeck.bridge.getSnapshot",
		})}\n`,
	);

	return response;
}

/**
 * Gets a JSON-RPC request id from a received message.
 * @param value Received JSON value.
 * @returns Request id when present.
 */
function getRequestId(value: JsonValue): string | undefined {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return undefined;
	}

	return typeof value.id === "string" ? value.id : undefined;
}

/**
 * Receives the next newline-delimited message from the client.
 * @param client Socket client.
 * @returns Received message, without its trailing newline.
 */
function receive(client: Socket): Promise<string> {
	const message = withResolvers<string>();

	let buffer = "";
	const onData = (chunk: string): void => {
		buffer += chunk;
		const newline = buffer.indexOf("\n");
		if (newline !== -1) {
			client.off("data", onData);
			message.resolve(buffer.slice(0, newline));
		}
	};

	client.on("data", onData);
	client.once("error", (err) => message.reject(err));
	return message.promise;
}
