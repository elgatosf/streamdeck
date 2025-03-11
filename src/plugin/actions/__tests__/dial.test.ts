import {
	DeviceType,
	type SetFeedback,
	type SetFeedbackLayout,
	type SetImage,
	type SetTriggerDescription,
	type WillAppear,
} from "../../../api";
import type { JsonObject } from "../../../common/json";
import { connection } from "../../connection";
import { Device } from "../../devices/device";
import { deviceStore } from "../../devices/store";
import { Action } from "../action";
import { DialAction } from "../dial";

jest.mock("../../devices/store");
jest.mock("../../logging");
jest.mock("../../manifest");
jest.mock("../../connection");

describe("DialAction", () => {
	// Mock source.
	const source: WillAppear<JsonObject> = {
		action: "com.test.action.one",
		context: "action123",
		device: "device123",
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

	beforeAll(() => jest.spyOn(deviceStore, "getDeviceById").mockReturnValue(device));

	/**
	 * Asserts the constructor of {@link DialAction} sets the properties from the source.
	 */
	it("constructor sets properties from source", () => {
		// Arrange, act.
		const action = new DialAction(source);

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
	 * Asserts the constructor of {@link DialAction} throws when the event is for a keypad.
	 */
	it("throws for non encoder", () => {
		// Arrange.
		const keypadSource: WillAppear<JsonObject> = {
			...source,
			payload: {
				...source.payload,
				controller: "Keypad",
			},
		};

		// Act, assert.
		expect(() => new DialAction(keypadSource)).toThrow();
	});

	/**
	 * Asserts {@link DialAction.toJSON} includes properties.
	 */
	it("JSON has properties", () => {
		// Array.
		const action = new DialAction({
			action: "action1",
			context: "com.test.action.one",
			device: "dev1",
			event: "willAppear",
			payload: {
				controller: "Encoder",
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
		const jsonObj: DialAction = JSON.parse(jsonStr);

		// Assert.
		expect(jsonObj.controllerType).toBe(action.controllerType);
		expect(jsonObj.coordinates).toStrictEqual(action.coordinates);
		expect(jsonObj.device).toStrictEqual({ id: action.device.id });
		expect(jsonObj.id).toBe(action.id);
		expect(jsonObj.manifestId).toBe(action.manifestId);
	});

	describe("sending", () => {
		let action!: DialAction;
		beforeAll(() => (action = new DialAction(source)));

		/**
		 * Asserts {@link DialAction.setFeedback} forwards the command to the {@link connection}.
		 */
		it("setFeedback", async () => {
			// Arrange, act.
			await action.setFeedback({
				bar: 50,
				title: "Hello world",
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetFeedback]>({
				context: action.id,
				event: "setFeedback",
				payload: {
					bar: 50,
					title: "Hello world",
				},
			});
		});

		/**
		 * Asserts {@link DialAction.setFeedbackLayout} forwards the command to the {@link connection}.
		 */
		it("Sends setFeedbackLayout", async () => {
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

		/**
		 * Asserts {@link DialAction.setImage} forwards the command to the {@link connection}.
		 */
		it("setImage", async () => {
			// Arrange, act
			await action.setImage();
			await action.setImage("./imgs/test.png");

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
				},
			});
		});

		/**
		 * Asserts {@link DialAction.setTitle} forwards the command to the {@link connection}.
		 */
		it("setTitle", async () => {
			// Arrange, act.
			await action.setTitle("Hello world");

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
		 * Asserts {@link DialAction.setTriggerDescription} forwards the command to the {@link connection}.
		 */
		it("setTriggerDescription", async () => {
			// Arrange, act.
			await action.setTriggerDescription();
			await action.setTriggerDescription({
				longTouch: "Long-touch",
				push: "Push",
				rotate: "Rotate",
				touch: "Touch",
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(2);
			expect(connection.send).toHaveBeenNthCalledWith<[SetTriggerDescription]>(1, {
				event: "setTriggerDescription",
				context: action.id,
				payload: {},
			});

			expect(connection.send).toHaveBeenNthCalledWith<[SetTriggerDescription]>(2, {
				event: "setTriggerDescription",
				context: action.id,
				payload: {
					longTouch: "Long-touch",
					push: "Push",
					rotate: "Rotate",
					touch: "Touch",
				},
			});
		});
	});
});
