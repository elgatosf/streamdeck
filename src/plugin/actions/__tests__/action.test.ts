import { beforeAll, describe, expect, it, test, vi } from "vitest";

import type { Settings } from "../../../api/__mocks__/events.js";
import { DeviceType, type GetSettings, type SetSettings, type ShowAlert, type WillAppear } from "../../../api/index.js";
import type { JsonObject } from "../../../common/json.js";
import { connection } from "../../connection.js";
import { Device } from "../../devices/device.js";
import { deviceStore } from "../../devices/store.js";
import { Action } from "../action.js";
import { DialAction } from "../dial.js";

vi.mock("../../devices/store.js");
vi.mock("../../logging/index.js");
vi.mock("../../manifest.js");
vi.mock("../../connection.js");

describe("Action", () => {
	// Mock source.
	const source: WillAppear<JsonObject> = {
		action: "com.test.action.one",
		context: "action123",
		device: "device123",
		event: "willAppear",
		payload: {
			controller: "Keypad",
			coordinates: {
				column: 1,
				row: 2,
			},
			isInMultiAction: false,
			resources: {},
			settings: {},
		},
	};

	// Mock device.
	const device = new Device(
		"device123",
		{
			name: "Device 1",
			size: {
				columns: 5,
				rows: 3,
			},
			type: DeviceType.StreamDeck,
		},
		true,
	);

	beforeAll(() => vi.spyOn(deviceStore, "getDeviceById").mockReturnValue(device));

	/**
	 * Asserts the constructor of {@link Action} sets the properties from the source.
	 */
	it("constructor sets properties from source", () => {
		// Arrange, act.
		const action = new Action(source);

		// Assert.
		expect(action).toBeInstanceOf(Action);
		expect(action.controllerType).toBe("Keypad");
		expect(action.device).toBe(device);
		expect(action.id).toBe(source.context);
		expect(action.manifestId).toBe(source.action);
		expect(deviceStore.getDeviceById).toHaveBeenCalledTimes(1);
		expect(deviceStore.getDeviceById).toHaveBeenLastCalledWith(source.device);
	});

	/**
	 * Asserts {@link Action.getSettings} requests the settings from the connection.
	 */
	it("getSettings", async () => {
		// Arrange.
		const action = new Action(source);

		// Array, act (Command).
		const settings = action.getSettings();

		// Assert (Command).
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenLastCalledWith<[GetSettings]>({
			event: "getSettings",
			context: action.id,
			id: expect.any(String),
		});

		await expect(Promise.race([settings, false])).resolves.toBe(false);

		// Act (Event).
		connection.emit("didReceiveSettings", {
			action: "com.other.test.one",
			context: "__other__", // Other action.
			event: "didReceiveSettings",
			device: "device123",
			payload: {
				controller: "Keypad",
				coordinates: {
					column: 0,
					row: 0,
				},
				isInMultiAction: false,
				resources: {},
				settings: {
					name: "Other",
				},
			},
		});

		connection.emit("didReceiveSettings", {
			action: action.manifestId,
			context: action.id, // Correct action.
			event: "didReceiveSettings",
			device: "device123",
			payload: {
				controller: "Keypad",
				coordinates: {
					column: 1,
					row: 3,
				},
				isInMultiAction: false,
				resources: {},
				settings: {
					name: "Elgato",
				},
			},
		});

		await settings;

		// Assert (Event).
		await expect(await settings).toEqual<Settings>({
			name: "Elgato",
		});
	});

	/**
	 * Asserts type-checking when the controller is "Keypad".
	 */
	test("keypad type assertion", () => {
		const action = new Action({
			...source,
			payload: {
				...source.payload,
				controller: "Keypad",
			},
		});

		expect(action.isKey()).toBe(true);
		expect(action.isDial()).toBe(false);
	});

	/**
	 * Asserts type-checking when the controller is "Encoder".
	 */
	test("encoder type assertion", () => {
		const action = new DialAction({
			...source,
			payload: {
				...source.payload,
				controller: "Encoder",
			},
		} as WillAppear<JsonObject>);

		expect(action.isDial()).toBe(true);
		expect(action.isKey()).toBe(false);
	});

	describe("sending", () => {
		let action!: Action;
		beforeAll(() => (action = new Action(source)));

		/**
		 * Asserts {@link Action.setSettings} forwards the command to the {@link connection}.
		 */
		it("setSettings", async () => {
			// Arrange, act.
			await action.setSettings({
				name: "Elgato",
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetSettings]>({
				context: action.id,
				event: "setSettings",
				payload: {
					name: "Elgato",
				},
			});
		});

		/**
		 * Asserts {@link Action.showAlert} forwards the command to the {@link connection}.
		 */
		it("showAlert", async () => {
			// Arrange, act.
			await action.showAlert();

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[ShowAlert]>({
				context: action.id,
				event: "showAlert",
			});
		});
	});
});
