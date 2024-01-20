import { getConnection } from "../../../tests/__mocks__/connection";
import * as mockEvents from "../../api/__mocks__/events";
import type {
	GetSettings,
	SendToPropertyInspector,
	SetFeedback,
	SetFeedbackLayout,
	SetImage,
	SetSettings,
	SetState,
	SetTitle,
	SetTriggerDescription,
	ShowAlert,
	ShowOk
} from "../../api/command";
import { ActionIdentifier, DidReceiveGlobalSettings } from "../../api/events";
import { Target } from "../../api/target";
import { Action } from "../action";

describe("Action", () => {
	/**
	 * Asserts the constructor of {@link Action} sets the {@link Action.manifestId} and {@link Action.id}.
	 */
	it("Constructor sets manifestId and id", () => {
		// Arrange.}
		const { connection } = getConnection();
		const source: ActionIdentifier = {
			action: "com.elgato.test.one",
			context: "ABC123"
		};

		// Act.
		const action = new Action(connection, source);

		// Assert.
		expect(action.id).toBe("ABC123");
		expect(action.manifestId).toBe("com.elgato.test.one");
	});

	/**
	 * Asserts {@link Action.getSettings} requests the settings from the connection.
	 */
	it("Can getSettings", async () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const action = new Action<mockEvents.Settings>(connection, {
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
		const other = JSON.parse(JSON.stringify(mockEvents.didReceiveSettings)); // Clone by value, not reference.
		other.context = "__XYZ123";
		other.payload.settings.name = "Other settings";
		emitMessage(other);

		const actual = JSON.parse(JSON.stringify(mockEvents.didReceiveSettings));
		actual.context = action.id;
		actual.action = action.manifestId;
		emitMessage(actual as DidReceiveGlobalSettings<mockEvents.Settings>);

		await settings;

		// Assert (Event).
		expect(await settings).toEqual<mockEvents.Settings>({
			name: "Elgato"
		});
	});

	/**
	 * Asserts {@link Action.sendToPropertyInspector} forwards the command to the Stream Deck connection.
	 */
	it("Sends sendToPropertyInspector", async () => {
		// Arrange.
		const { connection } = getConnection();
		const action = new Action(connection, {
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Act.
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
	 * Asserts {@link Action.setFeedback} forwards the command to the Stream Deck connection.
	 */
	it("Sends setFeedback", async () => {
		// Arrange.
		const { connection } = getConnection();
		const action = new Action(connection, {
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Act.
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
	 * Asserts {@link Action.setFeedbackLayout} forwards the command to the Stream Deck connection.
	 */
	it("Sends setFeedbackLayout", async () => {
		// Arrange.
		const { connection } = getConnection();
		const action = new Action(connection, {
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Act.
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
	 * Asserts {@link Action.setImage} forwards the command to the Stream Deck connection.
	 */
	it("Sends setImage", async () => {
		// Arrange.
		const { connection } = getConnection();
		const action = new Action(connection, {
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Act.
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
	 * Asserts {@link Action.setSettings} forwards the command to the Stream Deck connection.
	 */
	it("Sends setSettings", async () => {
		// Arrange.
		const { connection } = getConnection();
		const action = new Action<mockEvents.Settings>(connection, {
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Act.
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
	 * Asserts {@link Action.setState} forwards the command to the Stream Deck connection.
	 */
	it("Sends setState", async () => {
		// Arrange.
		const { connection } = getConnection();
		const action = new Action(connection, {
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Act.
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
	 * Asserts {@link Action.setTitle} forwards the command to the Stream Deck connection.
	 */
	it("Sends setTitle", async () => {
		// Arrange.
		const { connection } = getConnection();
		const action = new Action(connection, {
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Act.
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
	 * Asserts {@link Action.setTriggerDescription} forwards the command to the Stream Deck connection.
	 */
	it("Sends setTriggerDescription", async () => {
		// Arrange.
		const { connection } = getConnection();
		const action = new Action(connection, {
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Act.
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
	 * Asserts {@link Action.showAlert} forwards the command to the Stream Deck connection.
	 */
	it("Sends showAlert", async () => {
		// Arrange.
		const { connection } = getConnection();
		const action = new Action(connection, {
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Act.
		await action.showAlert();

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[ShowAlert]>({
			context: action.id,
			event: "showAlert"
		});
	});

	/**
	 * Asserts {@link Action.showOk} forwards the command to the Stream Deck connection.
	 */
	it("Sends showOk", async () => {
		// Arrange.
		const { connection } = getConnection();
		const action = new Action(connection, {
			action: "com.elgato.test.one",
			context: "ABC123"
		});

		// Act.
		await action.showOk();

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[ShowOk]>({
			context: action.id,
			event: "showOk"
		});
	});
});
