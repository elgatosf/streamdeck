import type { JsonObject } from "@elgato/utils";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { dialDown, dialRotate, dialUp, touchTap } from "../../../../api/__mocks__/events.js";
import {
	DeviceType,
	type SetFeedback,
	type SetFeedbackLayout,
	type SetImage,
	type SetTriggerDescription,
	type ShowAlert,
	type WillAppear,
} from "../../../../api/index.js";
import { connection } from "../../../connection.js";
import { Device } from "../../../devices/device.js";
import { deviceStore } from "../../../devices/store.js";
import { ActionBase } from "../action-base.js";
import { DialAction, type DialRotateArgs, type TouchTapArgs } from "../dial.js";

vi.mock("../../../devices/store.js");
vi.mock("../../../logging/index.js");
vi.mock("../../../manifest.js");
vi.mock("../../../connection.js");

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
	 * Asserts the constructor of {@link DialAction} sets the properties from the source.
	 */
	it("constructor sets properties from source", () => {
		// Arrange, act.
		const action = new DialAction(source);

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
				resources: {},
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
		const jsonObj: DialAction<JsonObject> = JSON.parse(jsonStr);

		// Assert.
		expect(jsonObj.controllerType).toBe(action.controllerType);
		expect(jsonObj.coordinates).toStrictEqual(action.coordinates);
		expect(jsonObj.device).toStrictEqual({
			id: action.device.id,
		});
		expect(jsonObj.id).toBe(action.id);
		expect(jsonObj.manifestId).toBe(action.manifestId);
	});

	describe("sending", () => {
		let action!: DialAction<JsonObject>;
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
	});

	describe("events", () => {
		// Source with the same identity as the mock events.
		const eventSource: WillAppear<JsonObject> = { ...source, action: dialDown.action, context: dialDown.context };

		// Dispose of the listeners registered by actions created during the test.
		afterEach(() =>
			connection.emit(`willDisappear:${eventSource.action}:${eventSource.context}`, {
				...eventSource,
				event: "willDisappear",
			}),
		);

		/**
		 * Asserts {@link DialAction.onDialDown} and {@link DialAction.onDialUp} are called, without arguments.
		 */
		it("calls onDialDown and onDialUp without arguments", () => {
			// Arrange.
			const onDialDown = vi.fn();
			const onDialUp = vi.fn();

			class TestAction extends DialAction<JsonObject> {
				/** @inheritdoc */
				public override onDialDown(...args: unknown[]): void {
					onDialDown(...args);
				}

				/** @inheritdoc */
				public override onDialUp(...args: unknown[]): void {
					onDialUp(...args);
				}
			}

			new TestAction(eventSource);

			// Act.
			connection.emit(`dialDown:${dialDown.action}:${dialDown.context}`, dialDown);
			connection.emit(`dialUp:${dialUp.action}:${dialUp.context}`, dialUp);

			// Assert.
			expect(onDialDown).toHaveBeenCalledTimes(1);
			expect(onDialDown).toHaveBeenCalledWith();
			expect(onDialUp).toHaveBeenCalledTimes(1);
			expect(onDialUp).toHaveBeenCalledWith();
		});

		/**
		 * Asserts {@link DialAction.onDialRotate} is called with only the rotation information.
		 */
		it("calls onDialRotate with the rotation", () => {
			// Arrange.
			const onDialRotate = vi.fn();

			class TestAction extends DialAction<JsonObject> {
				/** @inheritdoc */
				public override onDialRotate(args: DialRotateArgs): void {
					onDialRotate(args);
				}
			}

			new TestAction(eventSource);

			// Act.
			connection.emit(`dialRotate:${dialRotate.action}:${dialRotate.context}`, dialRotate);

			// Assert.
			expect(onDialRotate).toHaveBeenCalledTimes(1);
			expect(onDialRotate).toHaveBeenCalledWith<[DialRotateArgs]>({
				pressed: dialRotate.payload.pressed,
				ticks: dialRotate.payload.ticks,
			});
		});

		/**
		 * Asserts {@link DialAction.onTouchTap} is called with only the tap information.
		 */
		it("calls onTouchTap with the tap", () => {
			// Arrange.
			const onTouchTap = vi.fn();

			class TestAction extends DialAction<JsonObject> {
				/** @inheritdoc */
				public override onTouchTap(args: TouchTapArgs): void {
					onTouchTap(args);
				}
			}

			new TestAction(eventSource);

			// Act.
			connection.emit(`touchTap:${touchTap.action}:${touchTap.context}`, touchTap);

			// Assert.
			expect(onTouchTap).toHaveBeenCalledTimes(1);
			expect(onTouchTap).toHaveBeenCalledWith<[TouchTapArgs]>({
				hold: touchTap.payload.hold,
				tapPos: touchTap.payload.tapPos,
			});
		});

		/**
		 * Asserts event listeners are only added when the associated method is defined.
		 */
		it("does not listen for events without a method", () => {
			// Arrange.
			const spyOnOn = vi.spyOn(connection, "on");

			// Act.
			new DialAction(eventSource);

			// Assert.
			expect(spyOnOn).not.toHaveBeenCalled();
		});
	});
});
