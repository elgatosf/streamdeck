import type { JsonObject } from "..";
import type { DeviceInfo, DeviceType, Size, WillAppear } from "../../api";
import { Enumerable } from "../../common/enumerable";
import type { ActionContext } from "../actions/action";
import { DialAction } from "../actions/dial";
import { KeyAction } from "../actions/key";
import { KeyInMultiAction } from "../actions/multi";
import { connection } from "../connection";

/**
 * Provides information about a device.
 */
export class Device {
	/**
	 * Private backing field for {@link Device.actions}.
	 */
	#actions: Map<string, DialAction | KeyAction | KeyInMultiAction> = new Map();

	/**
	 * Private backing field for {@link Device.isConnected}.
	 */
	#isConnected: boolean = false;

	/**
	 * Actions currently visible on the device.
	 */
	public readonly actions: Enumerable<DialAction | KeyAction | KeyInMultiAction>;

	/**
	 * Unique identifier of the device.
	 */
	public readonly id: string;

	/**
	 * Name of the device, as specified by the user in the Stream Deck application.
	 */
	public readonly name: string;

	/**
	 * Number of action slots, excluding dials / touchscreens, available to the device.
	 */
	public readonly size: Size;

	/**
	 * Type of the device that was connected, e.g. Stream Deck +, Stream Deck Pedal, etc. See {@link DeviceType}.
	 */
	public readonly type: DeviceType;

	/**
	 * Initializes a new instance of the {@link Device} class.
	 * @param id Device identifier.
	 * @param info Information about the device.
	 * @param isConnected Determines whether the device is connected.
	 */
	constructor(id: string, info: DeviceInfo, isConnected: boolean) {
		this.actions = new Enumerable(this.#actions);
		this.id = id;
		this.#isConnected = isConnected;
		this.name = info.name;
		this.size = info.size;
		this.type = info.type;

		// Monitor the devices connection status.
		connection.prependListener("deviceDidConnect", (ev) => {
			if (ev.device === this.id) {
				this.#isConnected = true;
			}
		});

		connection.prependListener("deviceDidDisconnect", (ev) => {
			if (ev.device === this.id) {
				this.#isConnected = false;
			}
		});

		// Track the actions currently visible on the device.
		connection.prependListener("willAppear", (ev) => {
			if (ev.device === this.id) {
				this.#addAction(ev);
			}
		});

		connection.prependListener("willDisappear", (ev) => {
			if (ev.device === this.id) {
				this.#actions.delete(ev.context);
			}
		});
	}

	/**
	 * Determines whether the device is currently connected.
	 * @returns `true` when the device is connected; otherwise `false`.
	 */
	public get isConnected(): boolean {
		return this.#isConnected;
	}

	/**
	 * Gets the visible action on this device with the specified {@link id}.
	 * @param deviceId Identifier of the action to find.
	 * @returns The visible action; otherwise `undefined`.
	 */
	public getActionById(id: string): DialAction | KeyAction | KeyInMultiAction | undefined {
		return this.#actions.get(id);
	}

	/**
	 * Adds the specified action to the underlying collection of visible actions for the device.
	 * @param ev The action's appearance event.
	 */
	#addAction(ev: WillAppear<JsonObject>): void {
		const context: ActionContext = {
			device: this,
			id: ev.context,
			manifestId: ev.action
		};

		// Dial.
		if (ev.payload.controller === "Encoder") {
			this.#actions.set(
				ev.context,
				new DialAction({
					...context,
					coordinates: Object.freeze(ev.payload.coordinates)
				})
			);

			return;
		}

		// Key
		if (!ev.payload.isInMultiAction) {
			this.#actions.set(
				ev.context,
				new KeyAction({
					...context,
					coordinates: Object.freeze(ev.payload.coordinates)
				})
			);

			return;
		}

		// Multi-action key
		this.#actions.set(ev.context, new KeyInMultiAction(context));
	}
}
