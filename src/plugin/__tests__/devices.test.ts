import type { DeviceDidConnectEvent, DeviceDidDisconnectEvent } from "..";
import { DeviceType, type DeviceDidConnect, type DeviceDidDisconnect } from "../../api";
import { type connection as Connection } from "../connection";
import { type Device, type DeviceCollection } from "../devices";

jest.mock("../connection");
jest.mock("../logging");
jest.mock("../manifest");

describe("devices", () => {
	let connection!: typeof Connection;
	let devices!: DeviceCollection;

	beforeEach(async () => {
		jest.resetModules();
		({ connection } = await require("../connection"));
		({ devices } = await require("../devices"));
	});

	/**
	 * Asserts {@link DeviceCollection} can iterate over each device, and apply the specified callback function using {@link DeviceCollection.forEach}.
	 */
	it("applies callback with forEach", () => {
		// Arrange.
		const ev = {
			event: "deviceDidConnect",
			device: "devices.test.ts.1",
			deviceInfo: {
				name: "Device 1",
				size: { columns: 8, rows: 4 },
				type: DeviceType.StreamDeckXL
			}
		} satisfies DeviceDidConnect;

		connection.emit("connected", connection.registrationParameters.info);
		connection.emit("deviceDidConnect", ev);

		const listener = jest.fn();

		// Act.
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
			id: ev.device,
			isConnected: true,
			name: ev.deviceInfo.name,
			size: ev.deviceInfo.size,
			type: ev.deviceInfo.type
		});
	});

	/**
	 * Asserts {@link DeviceCollection.count} returns the count of devices.
	 */
	it("counts devices", () => {
		// Arrange.
		connection.emit("connected", connection.registrationParameters.info);

		// Act, assert: registration parameters are included.
		expect(devices.length).toBe(1);

		// Act, assert: count increments with new devices.
		const ev = {
			event: "deviceDidConnect",
			device: "devices.test.ts.1",
			deviceInfo: {
				name: "Device 1",
				size: { columns: 8, rows: 4 },
				type: DeviceType.StreamDeckXL
			}
		} satisfies DeviceDidConnect;
		connection.emit("deviceDidConnect", ev);

		expect(devices.length).toBe(2);

		// Act, assert: count remains 2 when device disconnected
		connection.emit("deviceDidDisconnect", {
			device: ev.device,
			event: "deviceDidDisconnect"
		});

		expect(devices.length).toBe(2);
	});

	/**
	 * Asserts {@link DeviceCollection} tracks devices supplied by Stream Deck as part of the registration parameters.
	 */
	it("adds devices from registration info", () => {
		// Arrange.
		connection.emit("connected", connection.registrationParameters.info);

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
	 * Asserts {@link DeviceCollection} adds devices when they connect.
	 */
	it("adds device on deviceDidConnect", () => {
		// Act.
		connection.emit("deviceDidConnect", {
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
		expect(devices.length).toBe(1);

		const [device] = devices;
		expect(device.id).toBe("__NEW_DEV__");
		expect(device.isConnected).toBeTruthy();
		expect(device.name).toBe("New Device");
		expect(device.size?.columns).toBe(8);
		expect(device.size?.rows).toBe(8);
		expect(device.type).toBe(DeviceType.StreamDeckMobile);
	});

	describe("getDeviceById", () => {
		/**
		 * Asserts selecting a known device using {@link DeviceCollection.getDeviceById}.
		 */
		it("known identifier", () => {
			// Arrange.
			connection.emit("deviceDidConnect", {
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

		/**
		 * Asserts selecting an unknown device using {@link DeviceCollection.getDeviceById}.
		 */
		it("unknown identifier", () => {
			// Arrange, act, assert.
			expect(devices.getDeviceById("__unknown")).toBeUndefined();
		});
	});

	/**
	 * Asserts {@link DeviceCollection} updates devices when they connect.
	 */
	it("updates device on deviceDidConnect", () => {
		// Arrange.
		connection.emit("connected", connection.registrationParameters.info);

		// Act.
		const [device] = devices;
		expect(device.isConnected).toBeFalsy();

		connection.emit("deviceDidConnect", {
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
	 * Asserts {@link DeviceCollection} updates devices when they disconnect.
	 */
	it("updates device on deviceDidDisconnect", () => {
		// Arrange.
		connection.emit("connected", connection.registrationParameters.info);

		// Act.
		const [device] = devices;
		expect(device.isConnected).toBeFalsy();

		connection.emit("deviceDidConnect", {
			event: "deviceDidConnect",
			device: connection.registrationParameters.info.devices[0].id,
			deviceInfo: connection.registrationParameters.info.devices[0]
		});

		expect(device.isConnected).toBeTruthy();
		connection.emit("deviceDidDisconnect", {
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
	 * Asserts {@link DeviceCollection} does not track unknown devices when they disconnect.
	 */
	it("ignores unknown devices on deviceDidDisconnect", () => {
		// Arrange.
		connection.emit("connected", connection.registrationParameters.info);

		// Act.
		const [device] = devices;
		expect(device.isConnected).toBeFalsy();

		connection.emit("deviceDidDisconnect", {
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
	 * Asserts {@link DeviceCollection.onDeviceDidConnect} is invoked when `deviceDidConnect` is emitted.
	 */
	it("receives onDeviceDidConnect", () => {
		// Arrange
		const listener = jest.fn();
		const spyOnDisposableOn = jest.spyOn(connection, "disposableOn");
		const ev = {
			device: "device123",
			deviceInfo: {
				name: "Test device",
				size: {
					columns: 8,
					rows: 4
				},
				type: DeviceType.StreamDeckXL
			},
			event: "deviceDidConnect"
		} satisfies DeviceDidConnect;

		// Act (emit).
		const disposable = devices.onDeviceDidConnect(listener);
		connection.emit("deviceDidConnect", ev);

		// Assert (emit).
		expect(spyOnDisposableOn).toHaveBeenCalledTimes(1);
		expect(spyOnDisposableOn).toHaveBeenCalledWith(ev.event, expect.any(Function));
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DeviceDidConnectEvent]>({
			device: {
				...ev.deviceInfo,
				id: ev.device,
				isConnected: true
			},
			type: "deviceDidConnect"
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link DeviceCollection.onDeviceDidDisconnect} is invoked when `deviceDidDisconnect` is emitted.
	 */
	it("receives onDeviceDidDisconnect", () => {
		// Arrange
		connection.emit("connected", connection.registrationParameters.info);

		const listener = jest.fn();
		const spyOnDisposableOn = jest.spyOn(connection, "disposableOn");
		const ev = {
			device: connection.registrationParameters.info.devices[0].id,
			event: "deviceDidDisconnect"
		} satisfies DeviceDidDisconnect;

		// Act (emit).
		const disposable = devices.onDeviceDidDisconnect(listener);
		connection.emit("deviceDidDisconnect", ev);

		// Assert (emit).
		expect(spyOnDisposableOn).toHaveBeenCalledTimes(1);
		expect(spyOnDisposableOn).toHaveBeenCalledWith(ev.event, expect.any(Function));
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DeviceDidDisconnectEvent]>({
			device: {
				...connection.registrationParameters.info.devices[0],
				isConnected: false
			},
			type: "deviceDidDisconnect"
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
