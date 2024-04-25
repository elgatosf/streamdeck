import { type DeviceInfo } from "../api/device";
import type { IDisposable } from "../common/disposable";
import { connection } from "./connection";
import { DeviceDidConnectEvent, DeviceDidDisconnectEvent, DeviceEvent } from "./events";

/**
 * Collection of tracked Stream Deck devices.
 */
class DeviceCollection {
	/**
	 * Collection of tracked Stream Deck devices.
	 */
	private readonly devices = new Map<string, Device>();

	/**
	 * Initializes a new instance of the {@link DeviceCollection} class.
	 */
	constructor() {
		// Add the devices based on the registration parameters.
		connection.once("connected", (info) => {
			info.devices.forEach((dev) => {
				this.devices.set(dev.id, {
					...dev,
					isConnected: false
				});
			});
		});

		// Set newly connected devices.
		connection.on("deviceDidConnect", ({ device: id, deviceInfo }) => {
			this.devices.set(
				id,
				Object.assign<Device | object, Device>(this.devices.get(id) || {}, {
					id,
					isConnected: true,
					...deviceInfo
				})
			);
		});

		// Updated disconnected devices.
		connection.on("deviceDidDisconnect", ({ device: id }) => {
			const device = this.devices.get(id);
			if (device !== undefined) {
				device.isConnected = false;
			}
		});
	}

	/**
	 * Gets the number of Stream Deck devices currently being tracked.
	 * @returns The device count.
	 */
	public get length(): number {
		return this.devices.size;
	}

	/**
	 * Gets the iterator capable of iterating the collection of Stream Deck devices.
	 * @returns Collection of Stream Deck devices
	 */
	public [Symbol.iterator](): IterableIterator<Readonly<Device>> {
		return this.devices.values();
	}

	/**
	 * Iterates over each {@link Device} and invokes the {@link callback} function.
	 * @param callback Function to invoke for each {@link Device}.
	 */
	public forEach(callback: (device: Readonly<Device>) => void): void {
		this.devices.forEach((value) => callback(value));
	}

	/**
	 * Gets the Stream Deck {@link Device} associated with the specified {@link deviceId}.
	 * @param deviceId Identifier of the Stream Deck device.
	 * @returns The Stream Deck device information; otherwise `undefined` if a device with the {@link deviceId} does not exist.
	 */
	public getDeviceById(deviceId: string): Device | undefined {
		return this.devices.get(deviceId);
	}

	/**
	 * Occurs when a Stream Deck device is connected. See also {@link DeviceCollection.onDeviceDidConnect}.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDeviceDidConnect(listener: (ev: DeviceDidConnectEvent) => void): IDisposable {
		return connection.disposableOn("deviceDidConnect", (ev) =>
			listener(
				new DeviceEvent(ev, {
					...ev.deviceInfo,
					...{ id: ev.device, isConnected: true }
				})
			)
		);
	}

	/**
	 * Occurs when a Stream Deck device is disconnected. See also {@link DeviceCollection.onDeviceDidDisconnect}.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDeviceDidDisconnect(listener: (ev: DeviceDidDisconnectEvent) => void): IDisposable {
		return connection.disposableOn("deviceDidDisconnect", (ev) =>
			listener(
				new DeviceEvent(ev, {
					...this.devices.get(ev.device),
					...{ id: ev.device, isConnected: false }
				})
			)
		);
	}
}

/**
 * Collection of tracked Stream Deck devices.
 */
export const devices = new DeviceCollection();

/**
 * Collection of tracked Stream Deck devices.
 */
export { type DeviceCollection };

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
