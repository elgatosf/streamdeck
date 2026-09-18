import type { JsonObject } from "@elgato/utils";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { DeviceType, type SetFeedback, type SetFeedbackLayout, type WillAppear } from "../../../api/index.js";
import { connection } from "../../connection.js";
import { Device } from "../../devices/device.js";
import { deviceStore } from "../../devices/store.js";
import { ActionBase } from "../action-base.js";
import { NeoInfobarAction } from "../neo-infobar.js";

vi.mock("../../devices/store.js");
vi.mock("../../logging/index.js");
vi.mock("../../manifest.js");
vi.mock("../../connection.js");

describe("NeoInfobarAction", () => {
	// Mock source.
	const source: WillAppear<JsonObject> = {
		action: "com.test.action.one",
		context: "action123",
		device: "device123",
		event: "willAppear",
		payload: {
			controller: "Neo",
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
			type: DeviceType.StreamDeckNeo,
		},
		true,
	);

	beforeAll(() => vi.spyOn(deviceStore, "getDeviceById").mockReturnValue(device));

	/**
	 * Asserts the constructor of {@link NeoInfobarAction} sets the properties from the source.
	 */
	it("constructor sets properties from source", () => {
		// Arrange, act.
		const action = new NeoInfobarAction(source);

		// Assert.
		expect(action).toBeInstanceOf(ActionBase);
		expect(action.coordinates.column).toBe(1);
		expect(action.coordinates.row).toBe(2);
		expect(action.device).toBe(device);
		expect(action.id).toBe(source.context);
		expect(action.manifestId).toBe(source.action);
		expect(deviceStore.getDeviceById).toHaveBeenCalledTimes(1);
		expect(deviceStore.getDeviceById).toHaveBeenLastCalledWith(source.device);
	});

	/**
	 * Asserts the constructor of {@link NeoInfobarAction} throws when the event is not for a Neo infobar.
	 */
	it("throws for non Neo controller", () => {
		// Arrange.
		const keypadSource: WillAppear<JsonObject> = {
			...source,
			payload: {
				...source.payload,
				controller: "Keypad",
			},
		};

		// Act, assert.
		expect(() => new NeoInfobarAction(keypadSource)).toThrow();
	});

	/**
	 * Asserts {@link NeoInfobarAction.toJSON} includes properties.
	 */
	it("JSON has properties", () => {
		// Arrange.
		const action = new NeoInfobarAction(source);

		// Act.
		const jsonStr = JSON.stringify(action);
		const jsonObj: NeoInfobarAction<JsonObject> = JSON.parse(jsonStr);

		// Assert.
		expect(jsonObj.controllerType).toBe(action.controllerType);
		expect(jsonObj.coordinates).toStrictEqual(action.coordinates);
		expect(jsonObj.device).toStrictEqual({ id: action.device.id });
		expect(jsonObj.id).toBe(action.id);
		expect(jsonObj.manifestId).toBe(action.manifestId);
	});

	describe("sending", () => {
		let action!: NeoInfobarAction<JsonObject>;
		beforeAll(() => (action = new NeoInfobarAction(source)));

		/**
		 * Asserts {@link NeoInfobarAction.setFeedback} forwards the command to the {@link connection}.
		 */
		it("setFeedback", async () => {
			// Arrange, act.
			await action.setFeedback({
				title: "Hello world",
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetFeedback]>({
				context: action.id,
				event: "setFeedback",
				payload: {
					title: "Hello world",
				},
			});
		});

		/**
		 * Asserts {@link NeoInfobarAction.setFeedbackLayout} forwards the command to the {@link connection}.
		 */
		it("setFeedbackLayout", async () => {
			// Arrange, act.
			await action.setFeedbackLayout("CustomLayout.json");

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetFeedbackLayout]>({
				context: action.id,
				event: "setFeedbackLayout",
				payload: {
					layout: "CustomLayout.json",
				},
			});
		});
	});
});
