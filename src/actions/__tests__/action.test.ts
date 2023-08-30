import { getMockedClient } from "../../../tests/__mocks__/client";
import * as mockEvents from "../../connectivity/__mocks__/events";
import {
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
} from "../../connectivity/commands";
import { DidReceiveGlobalSettings } from "../../connectivity/events";
import { Target } from "../../connectivity/target";
import { Action } from "../action";

describe("Action", () => {
	it("Constructor sets manifestId and id", () => {
		// Arrange.
		const { client } = getMockedClient();

		// Act.
		const action = new Action(client, "com.elgato.test.one", "ABC123");

		// Assert.
		expect(action.id).toBe("ABC123");
		expect(action.manifestId).toBe("com.elgato.test.one");
	});

	it("Can getSettings", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();
		const action = new Action<mockEvents.Settings>(client, "com.elgato.test.one", "ABC123");

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
		connection.__emit(other);

		const actual = JSON.parse(JSON.stringify(mockEvents.didReceiveSettings));
		actual.context = action.id;
		actual.action = action.manifestId;
		connection.__emit(actual as DidReceiveGlobalSettings);

		await settings;

		// Assert (Event).
		expect(await settings).toEqual<mockEvents.Settings>({
			name: "Elgato"
		});
	});

	it("Sends sendToPropertyInspector", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();
		const action = new Action(client, "com.elgato.test.one", "ABC123");

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

	it("Sends setFeedback", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();
		const action = new Action(client, "com.elgato.test.one", "ABC123");

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

	it("Sends setFeedbackLayout", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();
		const action = new Action(client, "com.elgato.test.one", "ABC123");

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

	it("Sends setImage", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();
		const action = new Action(client, "com.elgato.test.one", "ABC123");

		// Act.
		await action.setImage("imgs/test.png", 1, Target.Hardware);

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SetImage]>({
			context: action.id,
			event: "setImage",
			payload: {
				image: "imgs/test.png",
				state: 1,
				target: Target.Hardware
			}
		});
	});

	it("Sends setSettings", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();
		const action = new Action<mockEvents.Settings>(client, "com.elgato.test.one", "ABC123");

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

	it("Sends setState", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();
		const action = new Action(client, "com.elgato.test.one", "ABC123");

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

	it("Sends setTitle", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();
		const action = new Action(client, "com.elgato.test.one", "ABC123");

		// Act.
		await action.setTitle("Hello world", 0, Target.Software);

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SetTitle]>({
			context: action.id,
			event: "setTitle",
			payload: {
				title: "Hello world",
				state: 0,
				target: Target.Software
			}
		});
	});

	it("Sends setTriggerDescription", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();
		const action = new Action(client, "com.elgato.test.one", "ABC123");

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

	it("Sends showAlert", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();
		const action = new Action(client, "com.elgato.test.one", "ABC123");

		// Act.
		await action.showAlert();

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[ShowAlert]>({
			context: action.id,
			event: "showAlert"
		});
	});

	it("Sends showOk", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();
		const action = new Action(client, "com.elgato.test.one", "ABC123");

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
