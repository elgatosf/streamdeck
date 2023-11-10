import { getMockedLogger } from "../../tests/__mocks__/logging";
import { MockStreamDeckConnection } from "../connectivity/__mocks__/connection";
import * as mockEvents from "../connectivity/__mocks__/events";
import { registrationParameters } from "../connectivity/__mocks__/registration";
import { StreamDeckConnection } from "../connectivity/connection";
import { DeviceType } from "../connectivity/device-info";
import { Device, DeviceClient } from "../devices";
import { DeviceDidConnectEvent, DeviceDidDisconnectEvent } from "../events";

jest.mock("../connectivity/connection");

describe("DeviceClient", () => {
	/**
	 * Asserts {@link DeviceClient} can iterate over each device, and apply the specified callback function using {@link DeviceClient.forEach}.
	 */
	it("Applies callback with forEach", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;
		const devices = new DeviceClient(connection);
		const newDevice = connection.__emit({
			event: "deviceDidConnect",
			device: "devices.test.ts.1",
			deviceInfo: {
				name: "Device 1",
				size: { columns: 8, rows: 4 },
				type: DeviceType.StreamDeckXL
			}
		});

		// Act.
		const listener = jest.fn();
		devices.forEach(listener);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(2);
		expect(listener).toHaveBeenNthCalledWith<[Device]>(1, {
			id: registrationParameters.info.devices[0].id,
			isConnected: false,
			name: registrationParameters.info.devices[0].name,
			size: registrationParameters.info.devices[0].size,
			type: registrationParameters.info.devices[0].type
		});
		expect(listener).toHaveBeenNthCalledWith<[Device]>(2, {
			id: newDevice.device,
			isConnected: true,
			name: newDevice.deviceInfo.name,
			size: newDevice.deviceInfo.size,
			type: newDevice.deviceInfo.type
		});
	});

	/**
	 * Asserts {@link DeviceClient.count} returns the count of devices.
	 */
	it("Counts devices", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;
		const devices = new DeviceClient(connection);

		// Act, assert: registration parameters are included.
		expect(devices.length).toBe(1);

		// Act, assert: count increments with new devices.
		connection.__emit({
			event: "deviceDidConnect",
			device: "devices.test.ts.1",
			deviceInfo: {
				name: "Device 1",
				size: { columns: 8, rows: 4 },
				type: DeviceType.StreamDeckXL
			}
		});

		expect(devices.length).toBe(2);

		// Act, assert: count remains 2 when device disconnected
		connection.__emit({
			event: "deviceDidDisconnect",
			device: "devices.test.ts.1"
		});

		expect(devices.length).toBe(2);
	});

	/**
	 * Asserts {@link DeviceClient} tracks devices supplied by Stream Deck as part of the registration parameters.
	 */
	it("Adds devices from registration info", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;

		// Act.
		const devices = new DeviceClient(connection);

		// Assert.
		expect(devices.length).toBe(1);

		const [device] = devices;
		expect(device.id).toBe(registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(registrationParameters.info.devices[0].size);
		expect(device.type).toBe(registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceClient} adds devices when they connect.
	 */
	it("Adds device on deviceDidConnect", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;
		const devices = new DeviceClient(connection);

		// Act.
		connection.__emit({
			event: "deviceDidConnect",
			device: "__NEW_DEV__",
			deviceInfo: {
				name: "New Device",
				size: {
					columns: 8,
					rows: 8
				},
				type: DeviceType.StreamDeckMobile
			}
		});

		// Assert.
		expect(devices.length).toBe(2);

		const [, device] = devices;
		expect(device.id).toBe("__NEW_DEV__");
		expect(device.isConnected).toBeTruthy();
		expect(device.name).toBe("New Device");
		expect(device.size?.columns).toBe(8);
		expect(device.size?.rows).toBe(8);
		expect(device.type).toBe(DeviceType.StreamDeckMobile);
	});

	describe("getDevice", () => {
		it("Known identifier", () => {
			// Arrange.
			const { logger } = getMockedLogger();
			const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;
			const devices = new DeviceClient(connection);

			connection.__emit({
				event: "deviceDidConnect",
				device: "devices.test.ts.1",
				deviceInfo: {
					name: "New Device",
					size: {
						columns: 8,
						rows: 8
					},
					type: DeviceType.StreamDeckMobile
				}
			});

			// Act.
			const device = devices.getDevice("devices.test.ts.1");

			// Assert.
			expect(device).not.toBeUndefined();
			expect(device!.id).toBe("devices.test.ts.1");
			expect(device!.isConnected).toBeTruthy();
			expect(device!.name).toBe("New Device");
			expect(device!.size?.columns).toBe(8);
			expect(device!.size?.rows).toBe(8);
			expect(device!.type).toBe(DeviceType.StreamDeckMobile);
		});

		it("Unknown identifier", () => {
			// Arrange.
			const { logger } = getMockedLogger();
			const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;
			const devices = new DeviceClient(connection);

			// Act, assert.
			expect(devices.getDevice("__unknown")).toBeUndefined();
		});
	});

	/**
	 * Asserts {@link DeviceClient} updates devices when they connect.
	 */
	it("Updates device on deviceDidConnect", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;
		const devices = new DeviceClient(connection);

		// Act.
		const [device] = devices;
		expect(device.isConnected).toBeFalsy();

		connection.__emit({
			event: "deviceDidConnect",
			device: registrationParameters.info.devices[0].id,
			deviceInfo: registrationParameters.info.devices[0]
		});

		// Assert.
		expect(devices.length).toBe(1);

		expect(device.id).toBe(registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeTruthy();
		expect(device.name).toBe(registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(registrationParameters.info.devices[0].size);
		expect(device.type).toBe(registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceClient} updates devices when they disconnect.
	 */
	it("Updates device on deviceDidDisconnect", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;
		const devices = new DeviceClient(connection);

		// Act.
		const [device] = devices;
		expect(device.isConnected).toBeFalsy();

		connection.__emit({
			event: "deviceDidConnect",
			device: registrationParameters.info.devices[0].id,
			deviceInfo: registrationParameters.info.devices[0]
		});

		expect(device.isConnected).toBeTruthy();
		connection.__emit({
			event: "deviceDidDisconnect",
			device: registrationParameters.info.devices[0].id
		});

		// Assert.
		expect(devices.length).toBe(1);

		expect(device.id).toBe(registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(registrationParameters.info.devices[0].size);
		expect(device.type).toBe(registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceClient} does not track unknown devices when they disconnect.
	 */
	it("Ignores unknown devices on deviceDidDisconnect", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;
		const devices = new DeviceClient(connection);

		// Act.
		const [device] = devices;
		expect(device.isConnected).toBeFalsy();

		connection.__emit({
			event: "deviceDidDisconnect",
			device: "__UNKNOWN_DEVICE__"
		});

		// Assert.
		expect(devices.length).toBe(1);

		expect(device.id).toBe(registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(registrationParameters.info.devices[0].size);
		expect(device.type).toBe(registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceClient.onDeviceDidConnect} invokes the listener when the connection emits the `deviceDidConnect` event.
	 */
	it("Receives onDeviceDidConnect", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;
		const devices = new DeviceClient(connection);

		const listener = jest.fn();
		devices.onDeviceDidConnect(listener);

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
	 * Asserts {@link DeviceClient.onDeviceDidDisconnect} invokes the listener when the connection emits the `deviceDidDisconnect` event.
	 */
	it("Receives onDeviceDidDisconnect", () => {
		// Arrange.
		const { logger } = getMockedLogger();
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;
		const devices = new DeviceClient(connection);

		const listener = jest.fn();
		devices.onDeviceDidDisconnect(listener);

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
});
