import { Logger } from "../common/logging";
import { MockStreamDeckConnection } from "../connectivity/__mocks__/connection";
import { registrationParameters } from "../connectivity/__mocks__/registration";
import { StreamDeckConnection } from "../connectivity/connection";
import { DeviceType } from "../connectivity/device-info";
import { getDevices } from "../devices";

jest.mock("../common/logging");
jest.mock("../connectivity/connection");

describe("getDevices", () => {
	let logger: Logger;

	beforeEach(() => (logger = new Logger()));
	afterEach(() => jest.clearAllMocks());

	it("Adds devices from registration info", () => {
		// Arrange.
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;

		// Act.
		const devices = getDevices(connection);

		// Assert.
		expect(devices.size).toBe(1);

		const [[_, device]] = devices.entries();
		expect(device.id).toBe(registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(registrationParameters.info.devices[0].size);
		expect(device.type).toBe(registrationParameters.info.devices[0].type);
	});

	it("Adds device on deviceDidConnect", () => {
		// Arrange.
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;

		// Act.
		const devices = getDevices(connection);
		connection.__emit({
			event: "deviceDidConnect",
			device: "__NEW_DEV__",
			deviceInfo: {
				name: "New Device",
				size: {
					columns: 64,
					rows: 8
				},
				type: DeviceType.StreamDeckMobile
			}
		});

		// Assert.
		expect(devices.size).toBe(2);

		const [_, [__, device]] = devices.entries();
		expect(device.id).toBe("__NEW_DEV__");
		expect(device.isConnected).toBeTruthy();
		expect(device.name).toBe("New Device");
		expect(device.size?.columns).toBe(64);
		expect(device.size?.rows).toBe(8);
		expect(device.type).toBe(DeviceType.StreamDeckMobile);
	});

	it("Updates device on deviceDidConnect", () => {
		// Arrange.
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;

		// Act.
		const devices = getDevices(connection);
		const [[_, device]] = devices.entries();
		expect(device.isConnected).toBeFalsy();

		connection.__emit({
			event: "deviceDidConnect",
			device: registrationParameters.info.devices[0].id,
			deviceInfo: registrationParameters.info.devices[0]
		});

		// Assert.
		expect(devices.size).toBe(1);

		expect(device.id).toBe(registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeTruthy();
		expect(device.name).toBe(registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(registrationParameters.info.devices[0].size);
		expect(device.type).toBe(registrationParameters.info.devices[0].type);
	});

	it("Updates device on deviceDidDisconnect", () => {
		// Arrange.
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;

		// Act.
		const devices = getDevices(connection);
		const [[_, device]] = devices.entries();
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
		expect(devices.size).toBe(1);

		expect(device.id).toBe(registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(registrationParameters.info.devices[0].size);
		expect(device.type).toBe(registrationParameters.info.devices[0].type);
	});

	it("Ignores unknown devices on deviceDidDisconnect", () => {
		// Arrange.
		const connection = new StreamDeckConnection(registrationParameters, logger) as MockStreamDeckConnection;

		// Act.
		const devices = getDevices(connection);
		const [[_, device]] = devices.entries();
		expect(device.isConnected).toBeFalsy();

		connection.__emit({
			event: "deviceDidDisconnect",
			device: "__UNKNOWN_DEVICE__"
		});

		// Assert.
		expect(devices.size).toBe(1);

		expect(device.id).toBe(registrationParameters.info.devices[0].id);
		expect(device.isConnected).toBeFalsy();
		expect(device.name).toBe(registrationParameters.info.devices[0].name);
		expect(device.size).toEqual(registrationParameters.info.devices[0].size);
		expect(device.type).toBe(registrationParameters.info.devices[0].type);
	});
});
