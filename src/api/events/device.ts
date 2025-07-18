import type { DeviceInfo } from "../device";
import type { EventIdentifier } from "./index";

/**
 * Occurs when a Stream Deck device changed, for example its name or size.
 *
 * Available from Stream Deck 7.0.
 */
export type DeviceDidChange = DeviceIdentifier &
	EventIdentifier<"deviceDidChange"> & {
		/**
		 * Information about the device that changed.
		 */
		readonly deviceInfo: DeviceInfo;
	};

/**
 * Occurs when a Stream Deck device is connected. See also {@link DeviceDidDisconnect}.
 */
export type DeviceDidConnect = DeviceIdentifier &
	EventIdentifier<"deviceDidConnect"> & {
		/**
		 * Information about the newly connected device.
		 */
		readonly deviceInfo: DeviceInfo;
	};

/**
 * Occurs when a Stream Deck device is disconnected. See also {@link DeviceDidConnect}.
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
