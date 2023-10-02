import type { DeviceInfo } from "../device-info";
import type { EventIdentifier } from "./index";

/**
 * Occurs when a Stream Deck device is connected. Also see {@link DeviceDidDisconnect}.
 */
export type DeviceDidConnect = DeviceIdentifier &
	EventIdentifier<"deviceDidConnect"> & {
		/**
		 * Information about the newly connected device.
		 */
		readonly deviceInfo: DeviceInfo;
	};

/**
 * Occurs when a Stream Deck device is disconnected. Also see {@link DeviceDidConnect}.
 */
export type DeviceDidDisconnect = DeviceIdentifier & EventIdentifier<"deviceDidDisconnect">;

/**
 * Provide information that identifies a device associated with an event.
 */
export type DeviceIdentifier = {
	/**
	 * Unique identifier of the Stream Deck device that this event is associated with.
	 */
	readonly device: string;
};
