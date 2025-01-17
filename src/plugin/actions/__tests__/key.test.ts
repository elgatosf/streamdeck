import {
	DeviceType,
	type SetImage,
	type SetState,
	type SetTitle,
	type ShowOk,
	Target,
	type WillAppear,
} from "../../../api";
import type { JsonObject } from "../../../common/json";
import { connection } from "../../connection";
import { Device } from "../../devices/device";
import { deviceStore } from "../../devices/store";
import { Action } from "../action";
import { KeyAction } from "../key";

jest.mock("../../devices/store");
jest.mock("../../logging");
jest.mock("../../manifest");
jest.mock("../../connection");

describe("KeyAction", () => {
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
			settings: {},
		},
	};

	// Mock device.
	const device = new Device(
		"dev1",
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

	beforeAll(() => jest.spyOn(deviceStore, "getDeviceById").mockReturnValue(device));

	/**
	 * Asserts the constructor of {@link KeyAction} sets the context.
	 */
	it("constructor sets context", () => {
		// Arrange, act.
		const action = new KeyAction(source);

		// Assert.
		expect(action).toBeInstanceOf(Action);
		expect(action.coordinates).not.toBeUndefined();
		expect(action.coordinates?.column).toBe(1);
		expect(action.coordinates?.row).toBe(2);
		expect(action.device).toBe(device);
		expect(action.id).toBe(source.context);
		expect(action.manifestId).toBe(source.action);
		expect(deviceStore.getDeviceById).toHaveBeenCalledTimes(1);
		expect(deviceStore.getDeviceById).toHaveBeenLastCalledWith(source.device);
	});

	/**
	 * Asserts the constructor of {@link KeyAction} throws when the event is for a keypad.
	 */
	it("throws for non keypad", () => {
		// Arrange.
		const encoderSource: WillAppear<JsonObject> = {
			action: "com.test.action.one",
			context: "action1",
			device: "dev1",
			event: "willAppear",
			payload: {
				controller: "Encoder",
				coordinates: {
					column: 1,
					row: 2,
				},
				isInMultiAction: false,
				settings: {},
			},
		};

		// Act, assert.
		expect(() => new KeyAction(encoderSource)).toThrow();
	});

	/**
	 * Asserts the coordinates are undefined when the {@link KeyAction} is in a multi-action.
	 */
	it("does not have coordinates when multi-action", () => {
		// Arrange, act.
		const action = new KeyAction({
			action: "action1",
			context: "com.test.action.one",
			device: "dev1",
			event: "willAppear",
			payload: {
				controller: "Keypad",
				settings: {},
				isInMultiAction: true,
			},
		});

		// Assert.
		expect(action.coordinates).toBeUndefined();
	});

	/**
	 * Asserts {@link KeyAction.toJSON} includes properties.
	 */
	it("JSON has properties", () => {
		// Array.
		const action = new KeyAction({
			action: "action1",
			context: "com.test.action.one",
			device: "dev1",
			event: "willAppear",
			payload: {
				controller: "Keypad",
				settings: {},
				isInMultiAction: false,
				coordinates: {
					column: 1,
					row: 2,
				},
			},
		});

		// Act.
		const jsonStr = JSON.stringify(action);
		const jsonObj: KeyAction = JSON.parse(jsonStr);

		// Assert.
		expect(jsonObj.controllerType).toBe(action.controllerType);
		expect(jsonObj.coordinates).toStrictEqual(action.coordinates);
		expect(jsonObj.device).toStrictEqual({ id: action.device.id });
		expect(jsonObj.id).toBe(action.id);
		expect(jsonObj.isInMultiAction).toBe(action.isInMultiAction());
		expect(jsonObj.manifestId).toBe(action.manifestId);
	});

	describe("sending", () => {
		let action!: KeyAction;
		beforeAll(() => (action = new KeyAction(source)));

		/**
		 * Asserts {@link KeyAction.setImage} forwards the command to the {@link connection}.
		 */
		it("setImage", async () => {
			// Arrange, act
			await action.setImage();
			await action.setImage("./imgs/test.png", {
				state: 1,
				target: Target.Hardware,
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(2);
			expect(connection.send).toHaveBeenNthCalledWith<[SetImage]>(1, {
				context: action.id,
				event: "setImage",
				payload: {
					image: undefined,
					state: undefined,
					target: undefined,
				},
			});

			expect(connection.send).toHaveBeenNthCalledWith<[SetImage]>(2, {
				context: action.id,
				event: "setImage",
				payload: {
					image: "./imgs/test.png",
					state: 1,
					target: Target.Hardware,
				},
			});
		});

		/**
		 * Asserts {@link KeyAction.setState} forwards the command to the {@link connection}.
		 */
		it("setState", async () => {
			// Arrange, act.
			await action.setState(1);

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetState]>({
				context: action.id,
				event: "setState",
				payload: {
					state: 1,
				},
			});
		});

		/**
		 * Asserts {@link KeyAction.setTitle} forwards the command to the {@link connection}.
		 */
		it("setTitle", async () => {
			// Arrange, act.
			await action.setTitle("Hello world");
			await action.setTitle("This is a test", { state: 1, target: Target.Software });

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(2);
			expect(connection.send).toHaveBeenNthCalledWith<[SetTitle]>(1, {
				event: "setTitle",
				context: action.id,
				payload: {
					title: "Hello world",
				},
			});

			expect(connection.send).toHaveBeenNthCalledWith<[SetTitle]>(2, {
				event: "setTitle",
				context: action.id,
				payload: {
					state: 1,
					target: Target.Software,
					title: "This is a test",
				},
			});
		});

		/**
		 * Asserts {@link KeyAction.showOk} forwards the command to the {@link connection}.
		 */
		it("showOk", async () => {
			// Arrange, act
			await action.showOk();

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[ShowOk]>({
				context: action.id,
				event: "showOk",
			});
		});
	});
});
