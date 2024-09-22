import type { Controller, WillAppear, WillDisappear } from "../../api";
import type { JsonObject } from "../../common/json";
import type { Device } from "../devices";
import { deviceStore } from "../devices/store";

/**
 * Provides information about an instance of a Stream Deck action.
 */
export class ActionContext {
	/**
	 * Device the action is associated with.
	 */
	readonly #device: Device;

	/**
	 * Source of the action.
	 */
	readonly #source: WillAppear<JsonObject> | WillDisappear<JsonObject>;

	/**
	 * Initializes a new instance of the {@link ActionContext} class.
	 * @param source Source of the action.
	 */
	constructor(source: WillAppear<JsonObject> | WillDisappear<JsonObject>) {
		this.#source = source;

		const device = deviceStore.getDeviceById(source.device);
		if (!device) {
			throw new Error(`Failed to initialize action; device ${source.device} not found`);
		}

		this.#device = device;
	}

	/**
	 * Type of the action.
	 * - `Keypad` is a key.
	 * - `Encoder` is a dial and portion of the touch strip.
	 *
	 * @returns Controller type.
	 */
	public get controller(): Controller {
		return this.#source.payload.controller;
	}

	/**
	 * Stream Deck device the action is positioned on.
	 * @returns Stream Deck device.
	 */
	public get device(): Device {
		return this.#device;
	}

	/**
	 * Action instance identifier.
	 * @returns Identifier.
	 */
	public get id(): string {
		return this.#source.context;
	}

	/**
	 * Manifest identifier (UUID) for this action type.
	 * @returns Manifest identifier.
	 */
	public get manifestId(): string {
		return this.#source.action;
	}
}
