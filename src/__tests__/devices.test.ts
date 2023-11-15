import { getConnection } from "../../tests/__mocks__/connection";
import * as mockEvents from "../connectivity/__mocks__/events";
import { DeviceType } from "../connectivity/device-info";
import { Device, DeviceClient } from "../devices";
import { DeviceDidConnectEvent, DeviceDidDisconnectEvent } from "../events";

describe("DeviceClient", () => {
	/**
	 * Asserts {@link DeviceClient} can iterate over each device, and apply the specified callback function using {@link DeviceClient.forEach}.
	 */
	it("Applies callback with forEach", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const devices = new DeviceClient(connection);
		const newDevice = emitMessage({
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
			id: connection.registrationParameters.info.devices[0].id,
			isConnected: false,
			name: connection.registrationParameters.info.devices[0].name,
			size: connection.registrationParameters.info.devices[0].size,
			type: connection.registrationParameters.info.devices[0].type
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
		const { connection, emitMessage } = getConnection();
		const devices = new DeviceClient(connection);

		// Act, assert: registration parameters are included.
		expect(devices.length).toBe(1);

		// Act, assert: count increments with new devices.
		emitMessage({
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
		emitMessage({
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
		const { connection } = getConnection();

		// Act.
		const devices = new DeviceClient(connection);

		// Assert.
		expect(devices.length).toBe(1);

		const [device] = devices;
		expect(device.id).toBe(connection.registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(connection.registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(connection.registrationParameters.info.devices[0].size);
		expect(device.type).toBe(connection.registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceClient} adds devices when they connect.
	 */
	it("Adds device on deviceDidConnect", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const devices = new DeviceClient(connection);

		// Act.
		emitMessage({
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

	describe("getDeviceById", () => {
		it("Known identifier", () => {
			// Arrange.
			const { connection, emitMessage } = getConnection();
			const devices = new DeviceClient(connection);

			emitMessage({
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
			const device = devices.getDeviceById("devices.test.ts.1");

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
			const { connection } = getConnection();
			const devices = new DeviceClient(connection);

			// Act, assert.
			expect(devices.getDeviceById("__unknown")).toBeUndefined();
		});
	});

	/**
	 * Asserts {@link DeviceClient} updates devices when they connect.
	 */
	it("Updates device on deviceDidConnect", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const devices = new DeviceClient(connection);

		// Act.
		const [device] = devices;
		expect(device.isConnected).toBeFalsy();

		emitMessage({
			event: "deviceDidConnect",
			device: connection.registrationParameters.info.devices[0].id,
			deviceInfo: connection.registrationParameters.info.devices[0]
		});

		// Assert.
		expect(devices.length).toBe(1);

		expect(device.id).toBe(connection.registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeTruthy();
		expect(device.name).toBe(connection.registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(connection.registrationParameters.info.devices[0].size);
		expect(device.type).toBe(connection.registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceClient} updates devices when they disconnect.
	 */
	it("Updates device on deviceDidDisconnect", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const devices = new DeviceClient(connection);

		// Act.
		const [device] = devices;
		expect(device.isConnected).toBeFalsy();

		emitMessage({
			event: "deviceDidConnect",
			device: connection.registrationParameters.info.devices[0].id,
			deviceInfo: connection.registrationParameters.info.devices[0]
		});

		expect(device.isConnected).toBeTruthy();
		emitMessage({
			event: "deviceDidDisconnect",
			device: connection.registrationParameters.info.devices[0].id
		});

		// Assert.
		expect(devices.length).toBe(1);

		expect(device.id).toBe(connection.registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(connection.registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(connection.registrationParameters.info.devices[0].size);
		expect(device.type).toBe(connection.registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceClient} does not track unknown devices when they disconnect.
	 */
	it("Ignores unknown devices on deviceDidDisconnect", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const devices = new DeviceClient(connection);

		// Act.
		const [device] = devices;
		expect(device.isConnected).toBeFalsy();

		emitMessage({
			event: "deviceDidDisconnect",
			device: "__UNKNOWN_DEVICE__"
		});

		// Assert.
		expect(devices.length).toBe(1);

		expect(device.id).toBe(connection.registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(connection.registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(connection.registrationParameters.info.devices[0].size);
		expect(device.type).toBe(connection.registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceClient.onDeviceDidConnect} invokes the listener when the connection emits the `deviceDidConnect` event.
	 */
	it("Receives onDeviceDidConnect", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const devices = new DeviceClient(connection);

		const listener = jest.fn();
		devices.onDeviceDidConnect(listener);

		// Act.
		const { device } = emitMessage(mockEvents.deviceDidConnect);

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
		const { connection, emitMessage } = getConnection();
		const devices = new DeviceClient(connection);

		const listener = jest.fn();
		devices.onDeviceDidDisconnect(listener);

		// Act.
		const { device } = emitMessage(mockEvents.deviceDidDisconnect);

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
