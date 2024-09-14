import { Enumerable } from "..";
import type { IDisposable } from "../../common/disposable";
import { connection } from "../connection";
import { DeviceDidConnectEvent, DeviceDidDisconnectEvent, DeviceEvent } from "../events";
import { Device } from "./device";

const __devices = new Map<string, Device>();

/**
 * Collection of tracked Stream Deck devices.
 */
class DeviceCollection extends Enumerable<Device> {
	/**
	 * Initializes a new instance of the {@link DeviceCollection} class.
	 */
	constructor() {
		super(__devices);

		// Add the devices based on the registration parameters.
		connection.once("connected", (info) => {
			info.devices.forEach((dev) => __devices.set(dev.id, new Device(dev.id, dev, false)));
		});

		// Add new devices.
		connection.on("deviceDidConnect", ({ device: id, deviceInfo }) => {
			if (!__devices.get(id)) {
				__devices.set(id, new Device(id, deviceInfo, true));
			}
		});
	}

	/**
	 * Gets the Stream Deck {@link Device} associated with the specified {@link deviceId}.
	 * @param deviceId Identifier of the Stream Deck device.
	 * @returns The Stream Deck device information; otherwise `undefined` if a device with the {@link deviceId} does not exist.
	 */
	public getDeviceById(deviceId: string): Device | undefined {
		return __devices.get(deviceId);
	}

	/**
	 * Occurs when a Stream Deck device is connected. See also {@link DeviceCollection.onDeviceDidConnect}.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDeviceDidConnect(listener: (ev: DeviceDidConnectEvent) => void): IDisposable {
		return connection.disposableOn("deviceDidConnect", (ev) => listener(new DeviceEvent(ev, this.getDeviceById(ev.device)!)));
	}

	/**
	 * Occurs when a Stream Deck device is disconnected. See also {@link DeviceCollection.onDeviceDidDisconnect}.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDeviceDidDisconnect(listener: (ev: DeviceDidDisconnectEvent) => void): IDisposable {
		return connection.disposableOn("deviceDidDisconnect", (ev) => listener(new DeviceEvent(ev, this.getDeviceById(ev.device)!)));
	}
}

/**
 * Collection of tracked Stream Deck devices.
 */
export const devices = new DeviceCollection();

export { Device, type DeviceCollection };
