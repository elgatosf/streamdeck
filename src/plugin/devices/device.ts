import type { DeviceInfo, DeviceType, Size } from "../../api";
import type { DialAction } from "../actions/dial";
import type { KeyAction } from "../actions/key";
import { actionStore } from "../actions/store";
import { connection } from "../connection";

/**
 * Provides information about a device.
 */
export class Device {
	/**
	 * Private backing field for {@link Device.isConnected}.
	 */
	#isConnected: boolean = false;

	/**
	 * Private backing field for the device's information.
	 */
	#info: DeviceInfo;

	/**
	 * Unique identifier of the device.
	 */
	public readonly id: string;

	/**
	 * Initializes a new instance of the {@link Device} class.
	 * @param id Device identifier.
	 * @param info Information about the device.
	 * @param isConnected Determines whether the device is connected.
	 */
	constructor(id: string, info: DeviceInfo, isConnected: boolean) {
		this.id = id;
		this.#info = info;
		this.#isConnected = isConnected;

		// Set connected.
		connection.prependListener("deviceDidConnect", (ev) => {
			if (ev.device === this.id) {
				this.#info = ev.deviceInfo;
				this.#isConnected = true;
			}
		});

		// Set disconnected.
		connection.prependListener("deviceDidDisconnect", (ev) => {
			if (ev.device === this.id) {
				this.#isConnected = false;
			}
		});
	}

	/**
	 * Actions currently visible on the device.
	 * @returns Collection of visible actions.
	 */
	public get actions(): IterableIterator<DialAction | KeyAction> {
		return actionStore.filter((a) => a.device.id === this.id);
	}

	/**
	 * Determines whether the device is currently connected.
	 * @returns `true` when the device is connected; otherwise `false`.
	 */
	public get isConnected(): boolean {
		return this.#isConnected;
	}

	/**
	 * Name of the device, as specified by the user in the Stream Deck application.
	 * @returns Name of the device.
	 */
	public get name(): string {
		return this.#info.name;
	}

	/**
	 * Number of action slots, excluding dials / touchscreens, available to the device.
	 * @returns Size of the device.
	 */
	public get size(): Size {
		return this.#info.size;
	}

	/**
	 * Type of the device that was connected, e.g. Stream Deck +, Stream Deck Pedal, etc. See {@link DeviceType}.
	 * @returns Type of the device.
	 */
	public get type(): DeviceType {
		return this.#info.type;
	}
}
