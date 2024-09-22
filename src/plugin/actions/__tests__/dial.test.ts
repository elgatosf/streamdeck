import { type SetFeedback, type SetFeedbackLayout, type SetImage, type SetTriggerDescription, type WillAppear } from "../../../api";
import type { JsonObject } from "../../../common/json";
import { connection } from "../../connection";
import { Device } from "../../devices";
import { Action } from "../action";
import { DialAction } from "../dial";
import type { ActionContext } from "../store";

jest.mock("../../logging");
jest.mock("../../manifest");
jest.mock("../../connection");

describe("DialAction", () => {
	// Mock context.
	const context: ActionContext = {
		// @ts-expect-error Mocked device.
		device: new Device(),
		controller: "Keypad",
		id: "ABC123",
		manifestId: "com.elgato.test.one"
	};

	// Mock source.
	const source: WillAppear<JsonObject>["payload"] = {
		controller: "Encoder",
		coordinates: {
			column: 1,
			row: 2
		},
		isInMultiAction: false,
		settings: {}
	};

	/**
	 * Asserts the constructor of {@link DialAction} sets the context.
	 */
	it("constructor sets context", () => {
		// Arrange, act.
		const action = new DialAction(context, source);

		// Assert.
		expect(action).toBeInstanceOf(Action);
		expect(action.coordinates).not.toBeUndefined();
		expect(action.coordinates?.column).toBe(1);
		expect(action.coordinates?.row).toBe(2);
		expect(action.device).toBe(context.device);
		expect(action.id).toBe(context.id);
		expect(action.manifestId).toBe(context.manifestId);
	});

	describe("sending", () => {
		const action = new DialAction(context, source);

		/**
		 * Asserts {@link DialAction.setFeedback} forwards the command to the {@link connection}.
		 */
		it("setFeedback", async () => {
			// Arrange, act.
			await action.setFeedback({
				bar: 50,
				title: "Hello world"
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetFeedback]>({
				context: action.id,
				event: "setFeedback",
				payload: {
					bar: 50,
					title: "Hello world"
				}
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
					layout: "CustomLayout.json"
				}
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
					target: undefined
				}
			});

			expect(connection.send).toHaveBeenNthCalledWith<[SetImage]>(2, {
				context: action.id,
				event: "setImage",
				payload: {
					image: "./imgs/test.png"
				}
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
				touch: "Touch"
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(2);
			expect(connection.send).toHaveBeenNthCalledWith<[SetTriggerDescription]>(1, {
				event: "setTriggerDescription",
				context: action.id,
				payload: {}
			});

			expect(connection.send).toHaveBeenNthCalledWith<[SetTriggerDescription]>(2, {
				event: "setTriggerDescription",
				context: action.id,
				payload: {
					longTouch: "Long-touch",
					push: "Push",
					rotate: "Rotate",
					touch: "Touch"
				}
			});
		});
	});
});
