import type { DeviceDidChangeEvent, DeviceDidConnectEvent, DeviceDidDisconnectEvent } from "../..";
import { type DeviceDidChange, type DeviceDidConnect, type DeviceDidDisconnect, DeviceType } from "../../../api";
import { type connection as Connection } from "../../connection";
import { Device } from "../device";
import type { DeviceService } from "../service";

jest.mock("../../actions/store", () => {}); // Override default mock.
jest.mock("../../connection");
jest.mock("../../logging");
jest.mock("../../manifest");

describe("devices", () => {
	let connection!: typeof Connection;
	let deviceService!: DeviceService;

	beforeEach(async () => {
		jest.resetModules();
		({ connection } = await require("../../connection"));
		({ deviceService } = (await require("../service")) as typeof import("../service"));
	});

	/**
	 * Asserts {@link DeviceService} can iterate over each device, and apply the specified callback function using {@link DeviceService.forEach}.
	 */
	it("applies callback with forEach", () => {
		// Arrange.
		const ev = {
			event: "deviceDidConnect",
			device: "devices.test.ts.1",
			deviceInfo: {
				name: "Device 1",
				size: { columns: 8, rows: 4 },
				type: DeviceType.StreamDeckXL,
			},
		} satisfies DeviceDidConnect;

		connection.emit("connected", connection.registrationParameters.info);
		connection.emit("deviceDidConnect", ev);

		const listener = jest.fn();

		// Act.
		deviceService.forEach(listener);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(2);
		expect(listener).toHaveBeenNthCalledWith<[Device]>(
			1,
			new Device(
				connection.registrationParameters.info.devices[0].id,
				connection.registrationParameters.info.devices[0],
				false,
			),
		);
		expect(listener).toHaveBeenNthCalledWith<[Device]>(2, new Device(ev.device, ev.deviceInfo, true));
	});

	/**
	 * Asserts {@link DeviceService.count} returns the count of devices.
	 */
	it("counts devices", () => {
		// Arrange.
		connection.emit("connected", connection.registrationParameters.info);

		// Act, assert: registration parameters are included.
		expect(deviceService.length).toBe(1);

		// Act, assert: count increments with new devices.
		const ev = {
			event: "deviceDidConnect",
			device: "devices.test.ts.1",
			deviceInfo: {
				name: "Device 1",
				size: { columns: 8, rows: 4 },
				type: DeviceType.StreamDeckXL,
			},
		} satisfies DeviceDidConnect;
		connection.emit("deviceDidConnect", ev);

		expect(deviceService.length).toBe(2);

		// Act, assert: count remains 2 when device disconnected
		connection.emit("deviceDidDisconnect", {
			device: ev.device,
			event: "deviceDidDisconnect",
		});

		expect(deviceService.length).toBe(2);
	});

	/**
	 * Asserts {@link DeviceService} tracks devices supplied by Stream Deck as part of the registration parameters.
	 */
	it("adds devices from registration info", () => {
		// Arrange.
		connection.emit("connected", connection.registrationParameters.info);

		// Assert.
		expect(deviceService.length).toBe(1);

		const [device] = deviceService;
		expect(device.id).toBe(connection.registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(connection.registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(connection.registrationParameters.info.devices[0].size);
		expect(device.type).toBe(connection.registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceService} adds devices when they connect.
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
					rows: 8,
				},
				type: DeviceType.StreamDeckMobile,
			},
		});

		// Assert.
		expect(deviceService.length).toBe(1);

		const [device] = deviceService;
		expect(device.id).toBe("__NEW_DEV__");
		expect(device.isConnected).toBeTruthy();
		expect(device.name).toBe("New Device");
		expect(device.size?.columns).toBe(8);
		expect(device.size?.rows).toBe(8);
		expect(device.type).toBe(DeviceType.StreamDeckMobile);
	});

	/**
	 * Asserts {@link DeviceService} adds devices when they change (if they are unknown).
	 */
	it("adds device on deviceDidChange if they are unknown", () => {
		// Act.
		connection.emit("deviceDidChange", {
			event: "deviceDidChange",
			device: "vsd",
			deviceInfo: {
				name: "Virtual Stream Deck",
				size: {
					columns: 8,
					rows: 8,
				},
				type: DeviceType.StreamDeckMobile,
			},
		});

		// Assert.
		expect(deviceService.length).toBe(1);

		const [device] = deviceService;
		expect(device.id).toBe("vsd");
		expect(device.isConnected).toBe(false);
		expect(device.name).toBe("Virtual Stream Deck");
		expect(device.size?.columns).toBe(8);
		expect(device.size?.rows).toBe(8);
		expect(device.type).toBe(DeviceType.StreamDeckMobile);
	});

	describe("getDeviceById", () => {
		/**
		 * Asserts selecting a known device using {@link DeviceService.getDeviceById}.
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
						rows: 8,
					},
					type: DeviceType.StreamDeckMobile,
				},
			});

			// Act.
			const device = deviceService.getDeviceById("devices.test.ts.1");

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
		 * Asserts selecting an unknown device using {@link DeviceService.getDeviceById}.
		 */
		it("unknown identifier", () => {
			// Arrange, act, assert.
			expect(deviceService.getDeviceById("__unknown")).toBeUndefined();
		});
	});

	/**
	 * Asserts {@link DeviceService} updates devices when they connect.
	 */
	it("updates device on deviceDidConnect", () => {
		// Arrange.
		connection.emit("connected", connection.registrationParameters.info);

		// Act.
		const [device] = deviceService;
		expect(device.isConnected).toBeFalsy();

		connection.emit("deviceDidConnect", {
			event: "deviceDidConnect",
			device: connection.registrationParameters.info.devices[0].id,
			deviceInfo: connection.registrationParameters.info.devices[0],
		});

		// Assert.
		expect(deviceService.length).toBe(1);

		expect(device.id).toBe(connection.registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeTruthy();
		expect(device.name).toBe(connection.registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(connection.registrationParameters.info.devices[0].size);
		expect(device.type).toBe(connection.registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceService} updates devices when they disconnect.
	 */
	it("updates device on deviceDidDisconnect", () => {
		// Arrange.
		connection.emit("connected", connection.registrationParameters.info);

		// Act.
		const [device] = deviceService;
		expect(device.isConnected).toBeFalsy();

		connection.emit("deviceDidConnect", {
			event: "deviceDidConnect",
			device: connection.registrationParameters.info.devices[0].id,
			deviceInfo: connection.registrationParameters.info.devices[0],
		});

		expect(device.isConnected).toBeTruthy();
		connection.emit("deviceDidDisconnect", {
			event: "deviceDidDisconnect",
			device: connection.registrationParameters.info.devices[0].id,
		});

		// Assert.
		expect(deviceService.length).toBe(1);

		expect(device.id).toBe(connection.registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(connection.registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(connection.registrationParameters.info.devices[0].size);
		expect(device.type).toBe(connection.registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceService} does not track unknown devices when they disconnect.
	 */
	it("ignores unknown devices on deviceDidDisconnect", () => {
		// Arrange.
		connection.emit("connected", connection.registrationParameters.info);

		// Act.
		const [device] = deviceService;
		expect(device.isConnected).toBeFalsy();

		connection.emit("deviceDidDisconnect", {
			event: "deviceDidDisconnect",
			device: "__UNKNOWN_DEVICE__",
		});

		// Assert.
		expect(deviceService.length).toBe(1);

		expect(device.id).toBe(connection.registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(connection.registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(connection.registrationParameters.info.devices[0].size);
		expect(device.type).toBe(connection.registrationParameters.info.devices[0].type);
	});

	/**
	 * Asserts {@link DeviceService.onDeviceDidChange} is invoked when `deviceDidChange` is emitted.
	 */
	it("receive onDeviceDidChange", () => {
		// Arrange
		connection.emit("connected", connection.registrationParameters.info);

		const listener = jest.fn();
		const ev = {
			device: connection.registrationParameters.info.devices[0].id,
			deviceInfo: {
				name: "Test device",
				size: {
					columns: 8,
					rows: 4,
				},
				type: DeviceType.StreamDeckXL,
			},
			event: "deviceDidChange",
		} satisfies DeviceDidChange;

		// Act (emit).
		const disposable = deviceService.onDeviceDidChange(listener);
		connection.emit("deviceDidChange", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DeviceDidChangeEvent]>({
			device: new Device(ev.device, ev.deviceInfo, true),
			type: "deviceDidChange",
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link DeviceService.onDeviceDidConnect} is invoked when `deviceDidConnect` is emitted.
	 */
	it("receives onDeviceDidConnect", () => {
		// Arrange
		const listener = jest.fn();
		const ev = {
			device: "device123",
			deviceInfo: {
				name: "Test device",
				size: {
					columns: 8,
					rows: 4,
				},
				type: DeviceType.StreamDeckXL,
			},
			event: "deviceDidConnect",
		} satisfies DeviceDidConnect;

		// Act (emit).
		const disposable = deviceService.onDeviceDidConnect(listener);
		connection.emit("deviceDidConnect", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DeviceDidConnectEvent]>({
			device: new Device(ev.device, ev.deviceInfo, true),
			type: "deviceDidConnect",
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link DeviceService.onDeviceDidDisconnect} is invoked when `deviceDidDisconnect` is emitted.
	 */
	it("receives onDeviceDidDisconnect", () => {
		// Arrange
		connection.emit("connected", connection.registrationParameters.info);

		const listener = jest.fn();
		const ev = {
			device: connection.registrationParameters.info.devices[0].id,
			event: "deviceDidDisconnect",
		} satisfies DeviceDidDisconnect;

		// Act (emit).
		const disposable = deviceService.onDeviceDidDisconnect(listener);
		connection.emit("deviceDidDisconnect", ev);

		// Assert (emit).
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DeviceDidDisconnectEvent]>({
			device: new Device(
				connection.registrationParameters.info.devices[0].id,
				connection.registrationParameters.info.devices[0],
				false,
			),
			type: "deviceDidDisconnect",
		});

		// Act (dispose).
		disposable.dispose();
		connection.emit(ev.event, ev as any);

		// Assert(dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
