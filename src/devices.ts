import { StreamDeckConnection } from "./connectivity/connection";
import type { DeviceInfo } from "./connectivity/device-info";

/**
 * Gets a map of Stream Deck devices that are tracked against the specified `connection`.
 * @param connection Underlying connection that provides information into the registration parameters, and tracking of the connection status of devices.
 * @returns Map of Stream Deck devices.
 */
export function getDevices(connection: StreamDeckConnection): ReadonlyMap<string, Device> {
	const devices = new Map<string, Device>();

	// Add the devices based on the registration parameters.
	connection.registrationParameters.info.devices.forEach((dev) => {
		devices.set(dev.id, {
			...dev,
			isConnected: false
		});
	});

	// Set newly connected devices.
	connection.on("deviceDidConnect", ({ device: id, deviceInfo }) => {
		devices.set(
			id,
			Object.assign<Device | object, Device>(devices.get(id) || {}, {
				id,
				isConnected: true,
				...deviceInfo
			})
		);
	});

	// Updated disconnected devices.
	connection.on("deviceDidDisconnect", ({ device: id }) => {
		const device = devices.get(id);
		if (device !== undefined) {
			device.isConnected = false;
		}
	});

	return devices;
}

/**
 * Provides information about a device.
 */
export type Device = Partial<DeviceInfo> & {
	/**
	 * Unique identifier of the device.
	 */
	id: string;

	/**
	 * Determines whether the device is currently connected.
	 */
	isConnected: boolean;
};
