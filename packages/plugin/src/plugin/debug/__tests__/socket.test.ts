import { withResolvers } from "@elgato/utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { WillAppear } from "../../../api/index.js";

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

describe("debug socket", () => {
	let WebSocket: Awaited<typeof import("ws")>["default"];
	let debug: Awaited<typeof import("../adapter.js")>["debug"];
	let connection: Awaited<typeof import("../../connection.js")>["connection"];
	let debugSocket: Awaited<typeof import("../socket.js")>["debugSocket"];

	beforeEach(async () => {
		vi.resetModules();
		vi.doUnmock("ws");
		({ default: WebSocket } = await import("ws"));
		({ debug } = await import("../adapter.js"));
		({ connection } = await import("../../connection.js"));
		({ debugSocket } = await import("../socket.js"));
	});

	afterEach(async () => {
		await debugSocket.stop();
		vi.clearAllMocks();
	});

	it("serves snapshot requests over websocket", async () => {
		await debug.start();

		const client = new WebSocket(getSocketUrl());
		await open(client);

		const response = await getSnapshot(client);
		expect(JSON.parse(response)).toEqual({
			id: "request-1",
			jsonrpc: "2.0",
			result: debug.getSnapshot(),
		});

		client.close();
	});

	it("forwards snapshot change notifications to the connected websocket client", async () => {
		await debug.start();

		const client = new WebSocket(getSocketUrl());
		await open(client);

		const notification = receive(client);
		connection.emit("willAppear", createKeyWillAppear());

		expect(JSON.parse(await notification)).toEqual({
			jsonrpc: "2.0",
			method: "streamDeck.debug.snapshotChanged",
			params: debug.getSnapshot(),
		});

		client.close();
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
 * Gets the test websocket URL.
 * @returns Test websocket URL.
 */
function getSocketUrl(): string {
	return "ws://127.0.0.1:13345";
}

/**
 * Waits for the websocket client to open.
 * @param client Websocket client.
 */
async function open(client: WebSocketClient): Promise<void> {
	const opened = withResolvers<void>();
	client.once("open", () => opened.resolve());
	client.once("error", (err) => opened.reject(err));
	await opened.promise;
}

/**
 * Requests a snapshot over the websocket client.
 * @param client Websocket client.
 * @returns JSON-RPC response message.
 */
function getSnapshot(client: WebSocketClient): Promise<string> {
	const response = receive(client);
	client.send(
		JSON.stringify({
			id: "request-1",
			jsonrpc: "2.0",
			method: "streamDeck.debug.getSnapshot",
		}),
	);

	return response;
}

/**
 * Receives the next websocket message from the client.
 * @param client Websocket client.
 * @returns Received message.
 */
function receive(client: WebSocketClient): Promise<string> {
	const message = withResolvers<string>();
	client.once("message", (data) => message.resolve(data.toString()));
	client.once("error", (err) => message.reject(err));
	return message.promise;
}

type WebSocketClient = InstanceType<Awaited<typeof import("ws")>["default"]>;