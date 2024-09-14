import { Target, type ActionIdentifier, type SetFeedback, type SetFeedbackLayout, type SetImage, type SetTitle, type SetTriggerDescription, type ShowAlert } from "../../../api";
import { connection } from "../../connection";
import { Action } from "../action";
import { DialAction } from "../dial";

jest.mock("../../logging");
jest.mock("../../manifest");
jest.mock("../../connection");

describe("Action", () => {
	/**
	 * Asserts the constructor of {@link Dial} sets the {@link DialAction.manifestId} and {@link DialAction.id}.
	 */
	it("constructor sets manifestId and id", () => {
		// Arrange.
		const source: ActionIdentifier = {
			action: "com.elgato.test.one",
			context: "ABC123"
		};

		// Act.
		const dialAction = new DialAction(source);

		// Assert.
		expect(dialAction.id).toBe("ABC123");
		expect(dialAction.manifestId).toBe("com.elgato.test.one");
	});

	/**
	 * Asserts the inheritance of {@link KeyAction}.
	 */
	it("inherits shared methods", () => {
		// Arrange, act.
		const dialAction = new DialAction({
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Assert.
		expect(dialAction).toBeInstanceOf(Action);
	});

	describe("sending", () => {
		const dialAction = new DialAction({
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		/**
		 * Asserts {@link DialAction.setFeedback} forwards the command to the {@link connection}.
		 */
		it("setFeedback", async () => {
			// Arrange, act.
			await dialAction.setFeedback({
				bar: 50,
				title: "Hello world"
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetFeedback]>({
				context: dialAction.id,
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
			await dialAction.setFeedbackLayout("CustomLayout.json");

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetFeedbackLayout]>({
				context: dialAction.id,
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
			await dialAction.setImage();
			await dialAction.setImage("./imgs/test.png", {
				state: 1,
				target: Target.Hardware
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(2);
			expect(connection.send).toHaveBeenNthCalledWith<[SetImage]>(1, {
				context: dialAction.id,
				event: "setImage",
				payload: {
					image: undefined,
					state: undefined,
					target: undefined
				}
			});

			expect(connection.send).toHaveBeenNthCalledWith<[SetImage]>(2, {
				context: dialAction.id,
				event: "setImage",
				payload: {
					image: "./imgs/test.png",
					state: 1,
					target: Target.Hardware
				}
			});
		});

		/**
		 * Asserts {@link DialAction.setTitle} forwards the command to the {@link connection}.
		 */
		it("setTitle", async () => {
			// Arrange, act.
			await dialAction.setTitle("Hello world");
			await dialAction.setTitle("This is a test", { state: 1, target: Target.Software });

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
		 * Asserts {@link DialAction.setTriggerDescription} forwards the command to the {@link connection}.
		 */
		it("setTriggerDescription", async () => {
			// Arrange, act.
			await dialAction.setTriggerDescription();
			await dialAction.setTriggerDescription({
				longTouch: "Long-touch",
				push: "Push",
				rotate: "Rotate",
				touch: "Touch"
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(2);
			expect(connection.send).toHaveBeenNthCalledWith<[SetTriggerDescription]>(1, {
				event: "setTriggerDescription",
				context: dialAction.id,
				payload: {}
			});

			expect(connection.send).toHaveBeenNthCalledWith<[SetTriggerDescription]>(2, {
				event: "setTriggerDescription",
				context: dialAction.id,
				payload: {
					longTouch: "Long-touch",
					push: "Push",
					rotate: "Rotate",
					touch: "Touch"
				}
			});
		});

		/**
		 * Asserts {@link DialAction.showAlert} forwards the command to the {@link connection}.
		 */
		it("showAlert", async () => {
			// Arrange, act.
			await dialAction.showAlert();

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[ShowAlert]>({
				context: dialAction.id,
				event: "showAlert"
			});
		});
	});
});
