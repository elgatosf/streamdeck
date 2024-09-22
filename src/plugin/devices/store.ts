import { Enumerable } from "../../common/enumerable";
import type { Device } from "./device";

const __items = new Map<string, Device>();

/**
 * Provides a read-only store of Stream Deck devices.
 */
export class ReadOnlyDeviceStore extends Enumerable<Device> {
	/**
	 * Initializes a new instance of the {@link ReadOnlyDeviceStore}.
	 */
	constructor() {
		super(__items);
	}

	/**
	 * Gets the Stream Deck {@link Device} associated with the specified {@link deviceId}.
	 * @param deviceId Identifier of the Stream Deck device.
	 * @returns The Stream Deck device information; otherwise `undefined` if a device with the {@link deviceId} does not exist.
	 */
	public getDeviceById(deviceId: string): Device | undefined {
		return __items.get(deviceId);
	}
}

/**
 * Provides a store of Stream Deck devices.
 */
class DeviceStore extends ReadOnlyDeviceStore {
	/**
	 * Adds the device to the store.
	 * @param device The device.
	 */
	public set(device: Device): void {
		__items.set(device.id, device);
	}
}

/**
 * Singleton instance of the device store.
 */
export const deviceStore = new DeviceStore();
