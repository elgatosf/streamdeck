import { StreamDeckConnection } from "./connectivity/connection";
import type { DeviceInfo } from "./connectivity/device-info";
import { DeviceDidConnectEvent, DeviceDidDisconnectEvent, DeviceEvent } from "./events";

/**
 * Provides monitoring of Stream Deck devices.
 */
export class DeviceClient {
	/**
	 * Collection of tracked Stream Deck devices.
	 */
	private readonly devices = new Map<string, Device>();

	/**
	 * Initializes a new instance of the {@link DeviceClient} class.
	 * @param connection Connection with Stream Deck.
	 */
	constructor(private readonly connection: StreamDeckConnection) {
		// Add the devices based on the registration parameters.
		connection.registrationParameters.info.devices.forEach((dev) => {
			this.devices.set(dev.id, {
				...dev,
				isConnected: false
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
	public getDevice(deviceId: string): Device | undefined {
		return this.devices.get(deviceId);
	}

	/**
	 * Occurs when a Stream Deck device is connected. Also see {@link DeviceClient.onDeviceDidConnect}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDeviceDidConnect(listener: (ev: DeviceDidConnectEvent) => void): void {
		this.connection.on("deviceDidConnect", (ev) =>
			listener(
				new DeviceEvent(ev, {
					...ev.deviceInfo,
					...{ id: ev.device, isConnected: true }
				})
			)
		);
	}

	/**
	 * Occurs when a Stream Deck device is disconnected. Also see {@link DeviceClient.onDeviceDidDisconnect}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDeviceDidDisconnect(listener: (ev: DeviceDidDisconnectEvent) => void): void {
		this.connection.on("deviceDidDisconnect", (ev) =>
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
