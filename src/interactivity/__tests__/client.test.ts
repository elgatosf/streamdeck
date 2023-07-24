import type { EventEmitter } from "node:events";

import * as mockEvents from "../../connectivity/__mocks__/events";
import { StreamDeckConnection } from "../../connectivity/connection";
import { Event } from "../../connectivity/events";
import { Device } from "../../devices";
import { Action } from "../action";
import { StreamDeckClient } from "../client";
import {
	ApplicationDidLaunchEvent,
	ApplicationDidTerminateEvent,
	DeviceDidConnectEvent,
	DeviceDidDisconnectEvent,
	DialDownEvent,
	DialRotateEvent,
	DialUpEvent,
	DidReceiveGlobalSettingsEvent,
	DidReceiveSettingsEvent,
	KeyDownEvent,
	KeyUpEvent,
	PropertyInspectorDidAppearEvent,
	PropertyInspectorDidDisappearEvent,
	SendToPluginEvent,
	SystemDidWakeUpEvent,
	TitleParametersDidChangeEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent
} from "../events";

jest.mock("../../connectivity/connection");

describe("StreamDeckClient", () => {
	/**
	 * Asserts {@link StreamDeckClient.onApplicationDidLaunch} invokes the listener when the connection emits the `applicationDidLaunch` event.
	 */
	it("Receives onApplicationDidLaunch", () => {
		// Arrange.
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onApplicationDidLaunch(listener);

		// Act.
		const {
			payload: { application }
		} = emit(mockEvents.applicationDidLaunch).from(connection);

		//Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[ApplicationDidLaunchEvent]>({
			application,
			type: "applicationDidLaunch"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onApplicationDidTerminate} invokes the listener when the connection emits the `applicationDidTerminate` event.
	 */
	it("Receives onApplicationDidTerminate", () => {
		// Arrange.
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onApplicationDidTerminate(listener);

		// Act.
		const {
			payload: { application }
		} = emit(mockEvents.applicationDidTerminate).from(connection);

		//Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[ApplicationDidTerminateEvent]>({
			application,
			type: "applicationDidTerminate"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onDeviceDidConnect} invokes the listener when the connection emits the `deviceDidConnect` event.
	 */
	it("Receives onDeviceDidConnect", () => {
		// Arrange.
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onDeviceDidConnect(listener);

		// Act.
		const { device } = emit(mockEvents.deviceDidConnect).from(connection);

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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onDeviceDidDisconnect(listener);

		// Act.
		const { device } = emit(mockEvents.deviceDidDisconnect).from(connection);

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

		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, devices);
		const listener = jest.fn();
		client.onDeviceDidDisconnect(listener);

		// Act.
		const { device } = emit(mockEvents.deviceDidDisconnect).from(connection);

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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onDialDown(listener);

		// Act.
		const { action, context, device, payload } = emit(mockEvents.dialDown).from(connection);

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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onDialRotate(listener);

		// Act.
		const { action, context, device, payload } = emit(mockEvents.dialRotate).from(connection);

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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onDialUp(listener);

		// Act.
		const { action, context, device, payload } = emit(mockEvents.dialUp).from(connection);

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
	 * Asserts {@link StreamDeckClient.onDidReceiveGlobalSettings} invokes the listener when the connection emits the `didReceiveGlobalSettings` event.
	 */
	it("Receives onDidReceiveGlobalSettings", () => {
		// Arrange.
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onDidReceiveGlobalSettings(listener);

		// Act.
		const {
			payload: { settings }
		} = emit(mockEvents.didReceiveGlobalSettings).from(connection);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveGlobalSettingsEvent<mockEvents.Settings>]>({
			settings,
			type: "didReceiveGlobalSettings"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onDidReceiveSettings} invokes the listener when the connection emits the `didReceiveSettings` event.
	 */
	it("Receives onDidReceiveSettings", () => {
		// Arrange.
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onDidReceiveSettings(listener);

		// Act.
		const { action, context, device, payload } = emit(mockEvents.didReceiveSettings).from(connection);

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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onKeyDown(listener);

		// Act.
		const { action, context, device, payload } = emit(mockEvents.keyDown).from(connection);

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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onKeyUp(listener);

		// Act.
		const { action, context, device, payload } = emit(mockEvents.keyUp).from(connection);

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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onPropertyInspectorDidAppear(listener);

		// Act.
		const { action, context, device } = emit(mockEvents.propertyInspectorDidAppear).from(connection);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidAppearEvent]>({
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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onPropertyInspectorDidDisappear(listener);

		// Act.
		const { action, context, device } = emit(mockEvents.propertyInspectorDidDisappear).from(connection);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[PropertyInspectorDidDisappearEvent]>({
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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onSendToPlugin(listener);

		// Act.
		const { action, context, payload } = emit(mockEvents.sendToPlugin).from(connection);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[SendToPluginEvent<mockEvents.Settings>]>({
			action: new Action(client, action, context),
			payload,
			type: "sendToPlugin"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onSystemDidWakeUp} invokes the listener when the connection emits the `systemDidWakeUp` event.
	 */
	it("Receives onSystemDidWakeUp", () => {
		// Arrange.
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onSystemDidWakeUp(listener);

		// Act.
		emit(mockEvents.systemDidWakeUp).from(connection);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[SystemDidWakeUpEvent]>({
			type: "systemDidWakeUp"
		});
	});

	/**
	 * Asserts {@link StreamDeckClient.onTitleParametersDidChange} invokes the listener when the connection emits the `titleParametersDidChange` event.
	 */
	it("Receives onTitleParametersDidChange", () => {
		// Arrange.
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onTitleParametersDidChange(listener);

		// Act.
		const { action, context, device, payload } = emit(mockEvents.titleParametersDidChange).from(connection);

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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onTouchTap(listener);

		// Act.
		const { action, context, device, payload } = emit(mockEvents.touchTap).from(connection);

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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onWillAppear(listener);

		// Act.
		const { action, context, device, payload } = emit(mockEvents.willAppear).from(connection);

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
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());
		const listener = jest.fn();
		client.onWillDisappear(listener);

		// Act.
		const { action, context, device, payload } = emit(mockEvents.willDisappear).from(connection);

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
	 * Assert {@link StreamDeckClient.sendToPropertyInspector} forwards the message to the {@link StreamDeckConnection}.
	 */
	it("Sends sendToPropertyInspector", () => {
		// Arrange.
		const connection = new StreamDeckConnection();
		const client = new StreamDeckClient(connection, new Map<string, Device>());

		// Act.
		client.sendToPropertyInspector("ABC123", {
			name: "Elgato"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith("sendToPropertyInspector", {
			context: "ABC123",
			payload: {
				name: "Elgato"
			}
		});
	});
});

/**
 * Emits the specified {@link message} from a source.
 * @param message Message to emit from the connection.
 * @returns Function that can be used to determine the source, before finally emitting the event.
 */
function emit<T extends Event>(message: T) {
	return {
		from(source: unknown): T {
			(source as EventEmitter).emit(message.event, message);
			return message;
		}
	};
}
