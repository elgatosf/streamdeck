import { getMockedClient } from "../../tests/__mocks__/client";
import { Action } from "../actions/action";
import { StreamDeckClient } from "../client";
import * as mockEvents from "../connectivity/__mocks__/events";
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
} from "../connectivity/commands";
import { StreamDeckConnection } from "../connectivity/connection";
import { Target } from "../connectivity/target";
import { Device } from "../devices";
import {
	DeviceDidConnectEvent,
	DeviceDidDisconnectEvent,
	DialDownEvent,
	DialRotateEvent,
	DialUpEvent,
	DidReceiveSettingsEvent,
	KeyDownEvent,
	KeyUpEvent,
	PropertyInspectorDidAppearEvent,
	PropertyInspectorDidDisappearEvent,
	SendToPluginEvent,
	TitleParametersDidChangeEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent
} from "../events";

jest.mock("../logging");
jest.mock("../connectivity/connection");

describe("StreamDeckClient", () => {
	/**
	 * Asserts {@link StreamDeckClient.getSettings} sends the command, and awaits the settings.
	 */
	it("Can getSettings", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		// Act (Command).
		const settings = client.getSettings<mockEvents.Settings>(mockEvents.didReceiveSettings.context);

		// Assert (Command).
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenLastCalledWith({
			event: "getSettings",
			context: mockEvents.didReceiveSettings.context
		} as GetSettings);

		expect(Promise.race([settings, false])).resolves.toBe(false);

		// Act (Event).
		const other = JSON.parse(JSON.stringify(mockEvents.didReceiveSettings)); // Clone by value, not reference.
		other.context = "__XYZ123";
		other.payload.settings.name = "Other settings";

		connection.__emit(other);
		connection.__emit(mockEvents.didReceiveSettings);
		await settings;

		// Assert (Event).
		expect(await settings).toEqual<mockEvents.Settings>({
			name: "Elgato"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onDeviceDidConnect} invokes the listener when the connection emits the `deviceDidConnect` event.
	 */
	it("Receives onDeviceDidConnect", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onDeviceDidConnect(listener);

		// Act.
		const { device } = connection.__emit(mockEvents.deviceDidConnect);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DeviceDidConnectEvent]>({
			device: {
				id: device,
				isConnected: true,
				...mockEvents.deviceDidConnect.deviceInfo
			},
			type: mockEvents.deviceDidConnect.event
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onDeviceDidDisconnect} invokes the listener when the connection emits the `deviceDidDisconnect` event.
	 */
	it("Receives onDeviceDidDisconnect", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onDeviceDidDisconnect(listener);

		// Act.
		const { device } = connection.__emit(mockEvents.deviceDidDisconnect);

		// Assert.
		expect(listener).toBeCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DeviceDidDisconnectEvent]>({
			device: {
				id: device,
				isConnected: false,
				name: undefined,
				size: undefined,
				type: undefined
			},
			type: "deviceDidDisconnect"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onDeviceDidDisconnect} invokes the listener when the connection emits the `deviceDidDisconnect` event
	 * reads from the device cache.
	 */
	it("Receives onDeviceDidDisconnect (Cache)", () => {
		// Arrange.
		const devices = new Map<string, Device>();
		devices.set(mockEvents.deviceDidDisconnect.device, {
			id: mockEvents.deviceDidConnect.device,
			isConnected: true,
			...mockEvents.deviceDidConnect.deviceInfo
		});

		const { connection, client } = getMockedClient(devices);

		const listener = jest.fn();
		client.onDeviceDidDisconnect(listener);

		// Act.
		const { device } = connection.__emit(mockEvents.deviceDidDisconnect);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DeviceDidDisconnectEvent]>({
			device: {
				id: device,
				isConnected: false,
				...mockEvents.deviceDidConnect.deviceInfo
			},
			type: "deviceDidDisconnect"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onDialDown} invokes the listener when the connection emits the `dialDown` event.
	 */
	it("Receives onDialDown", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onDialDown(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.dialDown);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DialDownEvent<mockEvents.Settings>]>({
			action: new Action(client, action, context),
			deviceId: device,
			payload,
			type: "dialDown"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onDialRotate} invokes the listener when the connection emits the `dialRotate` event.
	 */
	it("Receives onDialRotate", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onDialRotate(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.dialRotate);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DialRotateEvent<mockEvents.Settings>]>({
			action: new Action(client, action, context),
			deviceId: device,
			payload,
			type: "dialRotate"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onDialUp} invokes the listener when the connection emits the `dialUp` event.
	 */
	it("Receives onDialUp", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onDialUp(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.dialUp);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DialUpEvent<mockEvents.Settings>]>({
			action: new Action(client, action, context),
			deviceId: device,
			payload,
			type: "dialUp"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onDidReceiveSettings} invokes the listener when the connection emits the `didReceiveSettings` event.
	 */
	it("Receives onDidReceiveSettings", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onDidReceiveSettings(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.didReceiveSettings);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveSettingsEvent<mockEvents.Settings>]>({
			action: new Action(client, action, context),
			deviceId: device,
			payload,
			type: "didReceiveSettings"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onKeyDown} invokes the listener when the connection emits the `keyDown` event.
	 */
	it("Receives onKeyDown", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onKeyDown(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.keyDown);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[KeyDownEvent<mockEvents.Settings>]>({
			action: new Action(client, action, context),
			deviceId: device,
			payload,
			type: "keyDown"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onKeyUp} invokes the listener when the connection emits the `keyUp` event.
	 */
	it("Receives onKeyUp", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onKeyUp(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.keyUp);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[KeyUpEvent<mockEvents.Settings>]>({
			action: new Action(client, action, context),
			deviceId: device,
			payload,
			type: "keyUp"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onPropertyInspectorDidAppear} invokes the listener when the connection emits the `propertyInspectorDidAppear` event.
	 */
	it("Receives onPropertyInspectorDidAppear", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onPropertyInspectorDidAppear(listener);

		// Act.
		const { action, context, device } = connection.__emit(mockEvents.propertyInspectorDidAppear);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidAppearEvent<never>]>({
			action: new Action(client, action, context),
			deviceId: device,
			type: "propertyInspectorDidAppear"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onPropertyInspectorDidDisappear} invokes the listener when the connection emits the `propertyInspectorDidDisappear` event.
	 */
	it("Receives onPropertyInspectorDidDisappear", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onPropertyInspectorDidDisappear(listener);

		// Act.
		const { action, context, device } = connection.__emit(mockEvents.propertyInspectorDidDisappear);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidDisappearEvent<never>]>({
			action: new Action(client, action, context),
			deviceId: device,
			type: "propertyInspectorDidDisappear"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onSendToPlugin} invokes the listener when the connection emits the `sendToPlugin` event.
	 */
	it("Receives onSendToPlugin", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onSendToPlugin(listener);

		// Act.
		const { action, context, payload } = connection.__emit(mockEvents.sendToPlugin);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[SendToPluginEvent<mockEvents.Settings, never>]>({
			action: new Action(client, action, context),
			payload,
			type: "sendToPlugin"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onTitleParametersDidChange} invokes the listener when the connection emits the `titleParametersDidChange` event.
	 */
	it("Receives onTitleParametersDidChange", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onTitleParametersDidChange(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.titleParametersDidChange);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[TitleParametersDidChangeEvent<mockEvents.Settings>]>({
			action: new Action(client, action, context),
			deviceId: device,
			payload,
			type: "titleParametersDidChange"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onTouchTap} invokes the listener when the connection emits the `touchTap` event.
	 */
	it("Receives onTouchTap", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onTouchTap(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.touchTap);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[TouchTapEvent<mockEvents.Settings>]>({
			action: new Action(client, action, context),
			deviceId: device,
			payload,
			type: "touchTap"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onWillAppear} invokes the listener when the connection emits the `willAppear` event.
	 */
	it("Receives onWillAppear", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onWillAppear(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.willAppear);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[WillAppearEvent<mockEvents.Settings>]>({
			action: new Action(client, action, context),
			deviceId: device,
			payload,
			type: "willAppear"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onWillDisappear} invokes the listener when the connection emits the `willDisappear` event.
	 */
	it("Receives onWillAppear", () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		const listener = jest.fn();
		client.onWillDisappear(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.willDisappear);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[WillDisappearEvent<mockEvents.Settings>]>({
			action: new Action(client, action, context),
			deviceId: device,
			payload,
			type: "willDisappear"
		});
	});

	/**
	 * Assert {@link StreamDeckClient.sendToPropertyInspector} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends sendToPropertyInspector", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		// Act.
		await client.sendToPropertyInspector("ABC123", {
			name: "Elgato"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SendToPropertyInspector]>({
			event: "sendToPropertyInspector",
			context: "ABC123",
			payload: {
				name: "Elgato"
			}
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.setFeedback} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setFeedback", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		// Act.
		await client.setFeedback("ABC123", {
			key1: {
				value: "Hello"
			},
			key2: 13
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SetFeedback]>({
			event: "setFeedback",
			context: "ABC123",
			payload: {
				key1: {
					value: "Hello"
				},
				key2: 13
			}
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.setFeedbackLayout} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setFeedback", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		// Act.
		await client.setFeedbackLayout("ABC123", "./layouts/custom.json");

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SetFeedbackLayout]>({
			event: "setFeedbackLayout",
			context: "ABC123",
			payload: {
				layout: "./layouts/custom.json"
			}
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.setImage} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setImage", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		// Act.
		await client.setImage("ABC123");
		await client.setImage("XYZ789", "./imgs/test.png", {
			state: 1,
			target: Target.Software
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(2);
		expect(connection.send).toHaveBeenNthCalledWith<[SetImage]>(1, {
			event: "setImage",
			context: "ABC123",
			payload: {
				image: undefined,
				state: undefined,
				target: undefined
			}
		});

		expect(connection.send).toHaveBeenNthCalledWith<[SetImage]>(2, {
			event: "setImage",
			context: "XYZ789",
			payload: {
				image: "./imgs/test.png",
				state: 1,
				target: 2
			}
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.setSettings} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setSettings", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		// Act.
		await client.setSettings("ABC123", {
			name: "Elgato"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SetSettings]>({
			event: "setSettings",
			context: "ABC123",
			payload: {
				name: "Elgato"
			}
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.setState} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setState", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		// Act.
		await client.setState("ABC123", 0);
		await client.setState("XYZ789", 1);

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(2);
		expect(connection.send).toHaveBeenNthCalledWith<[SetState]>(1, {
			event: "setState",
			context: "ABC123",
			payload: {
				state: 0
			}
		});

		expect(connection.send).toHaveBeenNthCalledWith<[SetState]>(2, {
			event: "setState",
			context: "XYZ789",
			payload: {
				state: 1
			}
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.setTitle} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setTitle", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		// Act.
		await client.setTitle("CTX1", "Hello world");
		await client.setTitle("CTX2", "This is a test", { state: 1, target: Target.Software });

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(2);
		expect(connection.send).toHaveBeenNthCalledWith<[SetTitle]>(1, {
			event: "setTitle",
			context: "CTX1",
			payload: {
				title: "Hello world"
			}
		});

		expect(connection.send).toHaveBeenNthCalledWith<[SetTitle]>(2, {
			event: "setTitle",
			context: "CTX2",
			payload: {
				state: 1,
				target: Target.Software,
				title: "This is a test"
			}
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.setTriggerDescription} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setTriggerDescription", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		// Act.
		await client.setTriggerDescription("ABC123");
		await client.setTriggerDescription("XYZ789", {
			longTouch: "Long-touch",
			push: "Push",
			rotate: "Rotate",
			touch: "Touch"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(2);
		expect(connection.send).toHaveBeenNthCalledWith<[SetTriggerDescription]>(1, {
			event: "setTriggerDescription",
			context: "ABC123",
			payload: {}
		});

		expect(connection.send).toHaveBeenNthCalledWith<[SetTriggerDescription]>(2, {
			event: "setTriggerDescription",
			context: "XYZ789",
			payload: {
				longTouch: "Long-touch",
				push: "Push",
				rotate: "Rotate",
				touch: "Touch"
			}
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.showAlert} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends showAlert", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		// Act.
		await client.showAlert("ABC123");

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[ShowAlert]>({
			event: "showAlert",
			context: "ABC123"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.showOk} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends showOk", async () => {
		// Arrange.
		const { connection, client } = getMockedClient();

		// Act.
		await client.showOk("ABC123");

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[ShowOk]>({
			event: "showOk",
			context: "ABC123"
		});
	});
});
