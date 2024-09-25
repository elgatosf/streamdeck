import type { IDisposable } from "../../common/disposable";
import { connection } from "../connection";
import { DeviceEvent, type DeviceDidConnectEvent, type DeviceDidDisconnectEvent } from "../events";
import { Device } from "./device";
import { ReadOnlyDeviceStore, deviceStore } from "./store";

/**
 * Provides functions, and information, for interacting with Stream Deck actions.
 */
class DeviceService extends ReadOnlyDeviceStore {
	/**
	 * Initializes a new instance of the {@link DeviceService}.
	 */
	constructor() {
		super();

		// Add the devices from registration parameters.
		connection.once("connected", (info) => {
			info.devices.forEach((dev) => deviceStore.set(new Device(dev.id, dev, false)));
		});

		// Add new devices.
		connection.on("deviceDidConnect", ({ device: id, deviceInfo }) => {
			if (!deviceStore.getDeviceById(id)) {
				deviceStore.set(new Device(id, deviceInfo, true));
			}
		});
	}

	/**
	 * Occurs when a Stream Deck device is connected. See also {@link DeviceService.onDeviceDidConnect}.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDeviceDidConnect(listener: (ev: DeviceDidConnectEvent) => void): IDisposable {
		return connection.disposableOn("deviceDidConnect", (ev) => listener(new DeviceEvent(ev, this.getDeviceById(ev.device)!)));
	}

	/**
	 * Occurs when a Stream Deck device is disconnected. See also {@link DeviceService.onDeviceDidDisconnect}.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDeviceDidDisconnect(listener: (ev: DeviceDidDisconnectEvent) => void): IDisposable {
		return connection.disposableOn("deviceDidDisconnect", (ev) => listener(new DeviceEvent(ev, this.getDeviceById(ev.device)!)));
	}
}

/**
 * Provides functions, and information, for interacting with Stream Deck actions.
 */
export const deviceService = new DeviceService();

export { type DeviceService };
