import { Enumerable } from "../../common/enumerable";
import type { ActionStore } from "../actions/store";
import { connection } from "../connection";
import { Device } from "./device";

const __devices = new Map<string, Device>();
let __actionStore: ActionStore;

// Add the devices from registration parameters.
connection.once("connected", (info) => {
	if (!__actionStore) {
		throw new Error("Device store has not yet been initialized");
	}

	info.devices.forEach((dev) => __devices.set(dev.id, new Device(dev.id, dev, false, __actionStore)));
});

// Add new devices.
connection.on("deviceDidConnect", ({ device: id, deviceInfo }) => {
	if (!__actionStore) {
		throw new Error("Device store has not yet been initialized");
	}

	if (!__devices.get(id)) {
		__devices.set(id, new Device(id, deviceInfo, true, __actionStore));
	}
});

/**
 * Provides a store of Stream Deck devices.
 */
export class DeviceStore extends Enumerable<Device> {
	/**
	 * Initializes a new instance of the {@link DeviceStore} class.
	 */
	constructor() {
		super(__devices);
	}

	/**
	 * Gets the Stream Deck {@link Device} associated with the specified {@link deviceId}.
	 * @param deviceId Identifier of the Stream Deck device.
	 * @returns The Stream Deck device information; otherwise `undefined` if a device with the {@link deviceId} does not exist.
	 */
	public getDeviceById(deviceId: string): Device | undefined {
		return __devices.get(deviceId);
	}
}

/**
 * Store of Stream Deck devices.
 */
export const deviceStore = new DeviceStore();

/**
 * Initializes the device store.
 * @param actionStore Store of Stream Deck actions.
 */
export function initializeStore(actionStore: ActionStore): void {
	__actionStore = actionStore;
}
