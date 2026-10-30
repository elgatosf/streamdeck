import type { JsonObject } from "@elgato/utils";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { keyDown, keyUp } from "../../../../api/__mocks__/events.js";
import {
	DeviceType,
	type SetImage,
	type SetState,
	type SetTitle,
	type ShowAlert,
	type ShowOk,
	Target,
	type WillAppear,
} from "../../../../api/index.js";
import { connection } from "../../../connection.js";
import { Device } from "../../../devices/device.js";
import { deviceStore } from "../../../devices/store.js";
import { ActionBase } from "../action-base.js";
import { KeyAction } from "../key.js";

vi.mock("../../../devices/store.js");
vi.mock("../../../logging/index.js");
vi.mock("../../../manifest.js");
vi.mock("../../../connection.js");

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
			resources: {},
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

	beforeAll(() => vi.spyOn(deviceStore, "getDeviceById").mockReturnValue(device));

	/**
	 * Asserts the constructor of {@link KeyAction} sets the context.
	 */
	it("constructor sets context", () => {
		// Arrange, act.
		const action = new KeyAction(source);

		// Assert.
		expect(action).toBeInstanceOf(ActionBase);
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
				resources: {},
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
				isInMultiAction: true,
				resources: {},
				settings: {},
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
				coordinates: {
					column: 1,
					row: 2,
				},
				isInMultiAction: false,
				resources: {},
				settings: {},
			},
		});

		// Act.
		const jsonStr = JSON.stringify(action);
		const jsonObj: KeyAction<JsonObject> = JSON.parse(jsonStr);

		// Assert.
		expect(jsonObj.controllerType).toBe(action.controllerType);
		expect(jsonObj.coordinates).toStrictEqual(action.coordinates);
		expect(jsonObj.device).toStrictEqual({
			id: action.device.id,
		});
		expect(jsonObj.id).toBe(action.id);
		expect(jsonObj.isInMultiAction).toBe(action.isInMultiAction());
		expect(jsonObj.manifestId).toBe(action.manifestId);
	});

	describe("sending", () => {
		let action!: KeyAction<JsonObject>;
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
			await action.setTitle("This is a test", {
				state: 1,
				target: Target.Software,
			});

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
		 * Asserts `showAlert` forwards the command to the {@link connection}.
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

	describe("events", () => {
		// Source with the same identity as the mock events.
		const eventSource: WillAppear<JsonObject> = { ...source, action: keyDown.action, context: keyDown.context };

		// Dispose of the listeners registered by actions created during the test.
		afterEach(() =>
			connection.emit(`willDisappear:${eventSource.action}:${eventSource.context}`, {
				...eventSource,
				event: "willDisappear",
			}),
		);

		/**
		 * Asserts {@link KeyAction.onKeyDown} and {@link KeyAction.onKeyUp} are called, without arguments.
		 */
		it("calls onKeyDown and onKeyUp without arguments", () => {
			// Arrange.
			const onKeyDown = vi.fn();
			const onKeyUp = vi.fn();

			class TestAction extends KeyAction<JsonObject> {
				/** @inheritdoc */
				public override onKeyDown(...args: unknown[]): void {
					onKeyDown(...args);
				}

				/** @inheritdoc */
				public override onKeyUp(...args: unknown[]): void {
					onKeyUp(...args);
				}
			}

			new TestAction(eventSource);

			// Act.
			connection.emit(`keyDown:${keyDown.action}:${keyDown.context}`, keyDown);
			connection.emit(`keyUp:${keyUp.action}:${keyUp.context}`, keyUp);

			// Assert.
			expect(onKeyDown).toHaveBeenCalledTimes(1);
			expect(onKeyDown).toHaveBeenCalledWith();
			expect(onKeyUp).toHaveBeenCalledTimes(1);
			expect(onKeyUp).toHaveBeenCalledWith();
		});

		/**
		 * Asserts event listeners are only added when the associated method is defined.
		 */
		it("does not listen for events without a method", () => {
			// Arrange.
			const spyOnOn = vi.spyOn(connection, "on");

			// Act.
			new KeyAction(eventSource);

			// Assert.
			expect(spyOnOn).not.toHaveBeenCalled();
		});

		/**
		 * Asserts methods are no longer called once the action disappears.
		 */
		it("stops calling methods after willDisappear", () => {
			// Arrange.
			const onKeyDown = vi.fn();

			class TestAction extends KeyAction<JsonObject> {
				/** @inheritdoc */
				public override onKeyDown(): void {
					onKeyDown();
				}
			}

			new TestAction(eventSource);
			connection.emit(`willDisappear:${eventSource.action}:${eventSource.context}`, {
				...eventSource,
				event: "willDisappear",
			});

			// Act.
			connection.emit(`keyDown:${keyDown.action}:${keyDown.context}`, keyDown);

			// Assert.
			expect(onKeyDown).not.toHaveBeenCalled();
		});
	});
});
