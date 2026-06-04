import { withResolvers } from "@elgato/utils";
import { createConnection, type Socket } from "node:net";
import { platform } from "node:os";
import { access } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { WillAppear } from "../../../api/index.js";
import { getDebugPipePath } from "../pipe-path.js";

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

// The plugin SDK derives its debug socket path from the (mocked) manifest UUID.
const pipePath = getDebugPipePath("com.elgato.test");

describe("debug socket", () => {
	let debug: Awaited<typeof import("../adapter.js")>["debug"];
	let connection: Awaited<typeof import("../../connection.js")>["connection"];
	let debugSocket: Awaited<typeof import("../socket.js")>["debugSocket"];

	beforeEach(async () => {
		vi.resetModules();
		({ debug } = await import("../adapter.js"));
		({ connection } = await import("../../connection.js"));
		({ debugSocket } = await import("../socket.js"));
	});

	afterEach(async () => {
		await debugSocket.stop();
		vi.clearAllMocks();
	});

	it("serves snapshot requests over the debug socket", async () => {
		await debug.start();
		const client = await connect();

		const response = await getSnapshot(client);
		expect(JSON.parse(response)).toEqual({
			id: "request-1",
			jsonrpc: "2.0",
			result: debug.getSnapshot(),
		});

		client.destroy();
	});

	it("forwards snapshot change notifications to the connected client", async () => {
		await debug.start();
		const client = await connect();

		const notification = receive(client);
		connection.emit("willAppear", createKeyWillAppear());

		expect(JSON.parse(await notification)).toEqual({
			jsonrpc: "2.0",
			method: "streamDeck.debug.snapshotChanged",
			params: debug.getSnapshot(),
		});

		client.destroy();
	});

	it("removes the socket file when stopped", async () => {
		await debug.start();
		if (platform() !== "win32") {
			await expect(access(pipePath)).resolves.toBeUndefined();
		}

		await debugSocket.stop();
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
			method: "streamDeck.debug.getSnapshot",
		})}\n`,
	);

	return response;
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
