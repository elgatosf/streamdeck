import {
	Target,
	type ActionIdentifier,
	type GetSettings,
	type SendToPropertyInspector,
	type SetFeedback,
	type SetFeedbackLayout,
	type SetImage,
	type SetSettings,
	type SetState,
	type SetTitle,
	type SetTriggerDescription,
	type ShowAlert,
	type ShowOk
} from "../../../api";
import { Settings } from "../../../api/__mocks__/events";
import { connection } from "../../connection";
import { Action } from "../action";

jest.mock("../../manifest");
jest.mock("../../connection");

describe("Action", () => {
	/**
	 * Asserts the constructor of {@link Action} sets the {@link Action.manifestId} and {@link Action.id}.
	 */
	it("constructor sets manifestId and id", () => {
		// Arrange.
		const source: ActionIdentifier = {
			action: "com.elgato.test.one",
			context: "ABC123"
		};

		// Act.
		const action = new Action(source);

		// Assert.
		expect(action.id).toBe("ABC123");
		expect(action.manifestId).toBe("com.elgato.test.one");
	});

	/**
	 * Asserts {@link Action.getSettings} requests the settings from the connection.
	 */
	it("getSettings", async () => {
		// Arrange.
		const action = new Action<Settings>({
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Act (Command).
		const settings = action.getSettings();

		// Assert (Command).
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenLastCalledWith<[GetSettings]>({
			event: "getSettings",
			context: action.id
		});

		expect(Promise.race([settings, false])).resolves.toBe(false);

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
					row: 0
				},
				isInMultiAction: false,
				settings: {
					name: "Other"
				}
			}
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
					row: 3
				},
				isInMultiAction: false,
				settings: {
					name: "Elgato"
				}
			}
		});

		await settings;

		// Assert (Event).
		expect(await settings).toEqual<Settings>({
			name: "Elgato"
		});
	});

	describe("sending", () => {
		const action = new Action({
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		/**
		 * Asserts {@link Action.sendToPropertyInspector} forwards the command to the {@link connection}.
		 */
		it("sendToPropertyInspector", async () => {
			// Arrange, act.
			await action.sendToPropertyInspector({
				name: "Elgato"
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SendToPropertyInspector]>({
				context: action.id,
				event: "sendToPropertyInspector",
				payload: {
					name: "Elgato"
				}
			});
		});

		/**
		 * Asserts {@link Action.setFeedback} forwards the command to the {@link connection}.
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
		 * Asserts {@link Action.setFeedbackLayout} forwards the command to the {@link connection}.
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
		 * Asserts {@link Action.setImage} forwards the command to the {@link connection}.
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
		 * Asserts {@link Action.setSettings} forwards the command to the {@link connection}.
		 */
		it("setSettings", async () => {
			// Arrange, act.
			await action.setSettings({
				name: "Elgato"
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetSettings]>({
				context: action.id,
				event: "setSettings",
				payload: {
					name: "Elgato"
				}
			});
		});

		/**
		 * Asserts {@link Action.setState} forwards the command to the {@link connection}.
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
		 * Asserts {@link Action.setTitle} forwards the command to the {@link connection}.
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
		 * Asserts {@link Action.setTriggerDescription} forwards the command to the {@link connection}.
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
				event: "showAlert"
			});
		});

		/**
		 * Asserts {@link Action.showOk} forwards the command to the {@link connection}.
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
