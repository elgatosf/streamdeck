import { type DeviceInfo } from "../api/device";
import type { IDisposable } from "../common/disposable";
import { Enumerable } from "../common/enumerable";
import { connection } from "./connection";
import { DeviceDidConnectEvent, DeviceDidDisconnectEvent, DeviceEvent } from "./events";
import store from "./store";

/**
 * Collection of tracked Stream Deck devices.
 */
class DeviceCollection extends Enumerable<Readonly<Device>> {
	/**
	 * Initializes a new instance of the {@link DeviceCollection} class.
	 */
	constructor() {
		super(store.devices);
	}

	/**
	 * Gets the Stream Deck {@link Device} associated with the specified {@link deviceId}.
	 * @param deviceId Identifier of the Stream Deck device.
	 * @returns The Stream Deck device information; otherwise `undefined` if a device with the {@link deviceId} does not exist.
	 */
	public getDeviceById(deviceId: string): Device | undefined {
		return store.devices.find((d) => d.id === deviceId);
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
					...this.getDeviceById(ev.device),
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
