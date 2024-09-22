import { Target, type SetImage, type SetState, type SetTitle, type ShowOk, type WillAppear } from "../../../api";
import type { JsonObject } from "../../../common/json";
import { connection } from "../../connection";
import { Device } from "../../devices/device";
import { Action } from "../action";
import { KeyAction } from "../key";
import type { ActionContext } from "../store";

jest.mock("../../devices/device");
jest.mock("../../logging");
jest.mock("../../manifest");
jest.mock("../../connection");

describe("KeyAction", () => {
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
		controller: "Keypad",
		coordinates: {
			column: 1,
			row: 2
		},
		isInMultiAction: false,
		settings: {}
	};

	/**
	 * Asserts the constructor of {@link KeyAction} sets the context.
	 */
	it("constructor sets context", () => {
		// Arrange, act.
		const action = new KeyAction(context, source);

		// Assert.
		expect(action).toBeInstanceOf(Action);
		expect(action.coordinates).not.toBeUndefined();
		expect(action.coordinates?.column).toBe(1);
		expect(action.coordinates?.row).toBe(2);
		expect(action.device).toBe(context.device);
		expect(action.id).toBe(context.id);
		expect(action.manifestId).toBe(context.manifestId);
	});

	/**
	 * Asserts the coordinates are undefined when the {@link KeyAction} is in a multi-action.
	 */
	it("does not have coordinates when multi-action", () => {
		// Arrange, act.
		const action = new KeyAction(context, {
			...source,
			isInMultiAction: true
		});

		// Assert.
		expect(action.coordinates).toBeUndefined();
	});

	describe("sending", () => {
		const action = new KeyAction(context, source);

		/**
		 * Asserts {@link KeyAction.setImage} forwards the command to the {@link connection}.
		 */
		it("setImage", async () => {
			// Arrange, act
			await action.setImage();
			await action.setImage("./imgs/test.png", {
				state: 1,
				target: Target.Hardware
			});

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
					image: "./imgs/test.png",
					state: 1,
					target: Target.Hardware
				}
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
					state: 1
				}
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
				context: "ABC123",
				payload: {
					title: "Hello world"
				}
			});

			expect(connection.send).toHaveBeenNthCalledWith<[SetTitle]>(2, {
				event: "setTitle",
				context: "ABC123",
				payload: {
					state: 1,
					target: Target.Software,
					title: "This is a test"
				}
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
				event: "showOk"
			});
		});
	});
});
