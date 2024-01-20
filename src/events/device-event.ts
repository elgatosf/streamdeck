import type { DeviceDidConnect, DeviceDidDisconnect } from "../api/events";
import { Event } from "./event";

/**
 * Provides information for events relating to a device.
 */
export class DeviceEvent<T extends DeviceDidConnect | DeviceDidDisconnect, TDevice> extends Event<T> {
	/**
	 * Initializes a new instance of the {@link DeviceEvent} class.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 * @param device Device that event is associated with.
	 */
	constructor(
		source: T,
		public readonly device: TDevice
	) {
		super(source);
	}
}
