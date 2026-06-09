import type { JsonRpcRequest, JsonRpcResponse } from "@elgato/utils/rpc";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DeviceType, type DeviceDidChange, type DidReceiveSettings, type WillAppear, type WillDisappear } from "../../../api/index.js";

vi.mock("../../connection.js");
vi.mock("../../manifest.js");

describe("debug adapter", () => {
	let adapter: Awaited<typeof import("../adapter.js")>["bridge"];
	let connection: Awaited<typeof import("../../connection.js")>["connection"];
	let sent: Array<JsonRpcRequest | JsonRpcResponse>;

	beforeEach(async () => {
		vi.resetModules();
		sent = [];

		({ connection } = await import("../../connection.js"));
		({ bridge: adapter } = await import("../adapter.js"));
		adapter.attachRpc(async (value) => {
			sent.push(value);
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("builds a snapshot from manifest actions and visible instances", () => {
		connection.emit("willAppear", createKeyWillAppear());

		expect(adapter.getSnapshot()).toEqual({
			actions: [
				{
					instances: [
						{
							context: "ctx_001",
							controller: "Keypad",
							device: "Device One",
							position: {
								column: 2,
								kind: "key",
								row: 3,
							},
							settings: {
								count: 42,
							},
						},
					],
					name: "Action One",
					uuid: "com.elgato.test.key",
				},
				{
					instances: [],
					name: "Action Two",
					uuid: "com.elgato.test.dial",
				},
			],
			plugin: {
				name: "Test Plugin",
				uuid: "com.elgato.test",
				version: "1.0.0",
			},
		});
	});

	it("publishes snapshot changes for visible instances", () => {
		connection.emit("willAppear", createKeyWillAppear());

		expect(sent).toEqual([
			{
				jsonrpc: "2.0",
				method: "streamDeck.bridge.snapshotChanged",
				params: adapter.getSnapshot(),
			},
		]);
	});

	it("normalizes dial and multi-action positions", () => {
		connection.emit("willAppear", createDialWillAppear());

		expect(adapter.getSnapshot().actions[1].instances[0]?.position).toEqual({
			column: 1,
			index: 1,
			kind: "dial",
			row: 0,
		});

		connection.emit("willAppear", createMultiActionWillAppear());

		expect(adapter.getSnapshot().actions[0].instances[0]?.position).toEqual({
			kind: "multi-action",
		});
	});

	it("updates settings, device details, and removals from connection events", () => {
		connection.emit("willAppear", createKeyWillAppear());
		clearMessages(sent);

		connection.emit("didReceiveSettings", createDidReceiveSettings());
		expect(adapter.getSnapshot().actions[0].instances[0]?.settings).toEqual({
			count: 7,
		});
		expect(sent).toHaveLength(1);

		clearMessages(sent);
		connection.emit("deviceDidChange", createDeviceDidChange());
		expect(adapter.getSnapshot().actions[0].instances[0]?.device).toBe("Renamed Device");
		expect(sent).toHaveLength(1);

		clearMessages(sent);
		connection.emit("willDisappear", createWillDisappear());
		expect(adapter.getSnapshot().actions[0].instances).toEqual([]);
		expect(sent).toHaveLength(1);
	});

	it("responds to getSnapshot RPC requests", async () => {
		connection.emit("willAppear", createKeyWillAppear());
		clearMessages(sent);

		const handled = await adapter.receive({
			id: "request-1",
			jsonrpc: "2.0",
			method: "streamDeck.bridge.getSnapshot",
		});

		expect(handled).toBe(true);
		expect(sent).toEqual([
			{
				id: "request-1",
				jsonrpc: "2.0",
				result: adapter.getSnapshot(),
			},
		]);
	});

	it("does not start the socket transport outside debug mode", async () => {
		vi.resetModules();
		vi.doMock("../../common/utils.js", async () => {
			const actual = await vi.importActual<typeof import("../../common/utils.js")>("../../common/utils.js");

			return {
				...actual,
				isDebugMode: vi.fn().mockReturnValue(false),
			};
		});
		vi.doMock("../socket.js", () => ({
			socket: {
				start: vi.fn().mockResolvedValue(undefined),
			},
		}));

		const { bridge } = await import("../adapter.js");
		const { socket } = await import("../socket.js");

		await bridge.start();

		expect(socket.start).not.toHaveBeenCalled();
	});
});

/**
 * Clears recorded JSON-RPC messages between assertions.
 * @param messages Recorded messages.
 */
function clearMessages(messages: Array<JsonRpcRequest | JsonRpcResponse>): void {
	messages.splice(0, messages.length);
}

/**
 * Creates a device-change event for the seeded mock device.
 * @returns Device-change event.
 */
function createDeviceDidChange(): DeviceDidChange {
	return {
		device: "DEV1",
		deviceInfo: {
			name: "Renamed Device",
			size: {
				columns: 5,
				rows: 3,
			},
			type: DeviceType.StreamDeckXL,
		},
		event: "deviceDidChange",
	};
}

/**
 * Creates a settings update for the visible test key.
 * @returns Did-receive-settings event.
 */
function createDidReceiveSettings(): DidReceiveSettings<{ count: number }> {
	return {
		action: "com.elgato.test.key",
		context: "ctx_001",
		device: "DEV1",
		event: "didReceiveSettings",
		payload: {
			controller: "Keypad",
			coordinates: {
				column: 2,
				row: 3,
			},
			isInMultiAction: false,
			resources: {},
			settings: {
				count: 7,
			},
		},
	};
}

/**
 * Creates a visible dial instance event.
 * @returns Will-appear event for a dial.
 */
function createDialWillAppear(): WillAppear<{ target: string }> {
	return {
		action: "com.elgato.test.dial",
		context: "ctx_002",
		device: "DEV1",
		event: "willAppear",
		payload: {
			controller: "Encoder",
			coordinates: {
				column: 1,
				row: 0,
			},
			isInMultiAction: false,
			resources: {},
			settings: {
				target: "master",
			},
		},
	};
}

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
 * Creates a visible multi-action key instance event.
 * @returns Will-appear event for a multi-action key.
 */
function createMultiActionWillAppear(): WillAppear<{ count: number }> {
	return {
		action: "com.elgato.test.key",
		context: "ctx_003",
		device: "DEV1",
		event: "willAppear",
		payload: {
			controller: "Keypad",
			isInMultiAction: true,
			resources: {},
			settings: {
				count: 99,
			},
		},
	};
}

/**
 * Creates a disappearance event for the visible test key.
 * @returns Will-disappear event for a key.
 */
function createWillDisappear(): WillDisappear<{ count: number }> {
	return {
		action: "com.elgato.test.key",
		context: "ctx_001",
		device: "DEV1",
		event: "willDisappear",
		payload: {
			controller: "Keypad",
			coordinates: {
				column: 2,
				row: 3,
			},
			isInMultiAction: false,
			resources: {},
			settings: {
				count: 7,
			},
		},
	};
}