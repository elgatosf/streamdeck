import type { IDisposable } from "../../common/disposable";
import { connection } from "../connection";
import {
	type DeviceDidChangeEvent,
	type DeviceDidConnectEvent,
	type DeviceDidDisconnectEvent,
	DeviceEvent,
} from "../events";
import { requiresVersion } from "../validation";
import { Device } from "./device";
import { deviceStore, ReadOnlyDeviceStore } from "./store";

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

		// Add new devices that were connected.
		connection.on("deviceDidConnect", ({ device: id, deviceInfo }) => {
			if (!deviceStore.getDeviceById(id)) {
				deviceStore.set(new Device(id, deviceInfo, true));
			}
		});

		// Add new devices that were changed (Virtual Stream Deck event race).
		connection.on("deviceDidChange", ({ device: id, deviceInfo }) => {
			if (!deviceStore.getDeviceById(id)) {
				deviceStore.set(new Device(id, deviceInfo, false));
			}
		});
	}

	/**
	 * Occurs when a Stream Deck device changed, for example its name or size.
	 *
	 * Available from Stream Deck 7.0.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDeviceDidChange(listener: (ev: DeviceDidChangeEvent) => void): IDisposable {
		requiresVersion(7.0, connection.version, "onDeviceDidChange");
		return connection.disposableOn("deviceDidChange", (ev) =>
			listener(new DeviceEvent(ev, this.getDeviceById(ev.device)!)),
		);
	}

	/**
	 * Occurs when a Stream Deck device is connected. See also {@link DeviceService.onDeviceDidConnect}.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDeviceDidConnect(listener: (ev: DeviceDidConnectEvent) => void): IDisposable {
		return connection.disposableOn("deviceDidConnect", (ev) =>
			listener(new DeviceEvent(ev, this.getDeviceById(ev.device)!)),
		);
	}

	/**
	 * Occurs when a Stream Deck device is disconnected. See also {@link DeviceService.onDeviceDidDisconnect}.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDeviceDidDisconnect(listener: (ev: DeviceDidDisconnectEvent) => void): IDisposable {
		return connection.disposableOn("deviceDidDisconnect", (ev) =>
			listener(new DeviceEvent(ev, this.getDeviceById(ev.device)!)),
		);
	}
}

/**
 * Provides functions, and information, for interacting with Stream Deck actions.
 */
export const deviceService = new DeviceService();

export { type DeviceService };
