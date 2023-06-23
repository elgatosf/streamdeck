import { DeviceInfo, StreamDeckConnection } from "./connectivity";

/**
 * Provides tracking of connected / disconnected Stream Deck devices.
 */
export class DeviceCollection {
	/**
	 * Devices that have been connected to the Stream Deck application.
	 */
	private readonly devices = new Map<string, Device>();

	/**
	 * Initializes a new instance of the `DeviceCollection` class.
	 * @param connection Connection used to determine when a device connects or disconnects.
	 */
	constructor(connection: StreamDeckConnection) {
		connection.on("deviceDidConnect", (ev) => {
			this.devices.set(ev.device, {
				id: ev.device,
				isConnected: true,
				...ev.deviceInfo
			});
		});

		connection.on("deviceDidDisconnect", (ev) => {
			const device = this.devices.get(ev.device);
			if (device !== undefined) {
				device.isConnected = false;
			}
		});
	}

	/**
	 * Gets the device for the specified `id`. **NB** Device information is cached per session; when a device is connected it's information is stored locally enabling for that information
	 * to be retrieved later, even if disconnected. However, if the device has not connected during this session, the devices information will not be available.
	 * @param id Device identifier whose device should be selected.
	 * @returns Device information currently available based on previously connected devices.
	 */
	public getDevice(id: string): Device {
		return (
			this.devices.get(id) || {
				id,
				isConnected: false
			}
		);
	}
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
