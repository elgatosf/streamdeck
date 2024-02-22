import { DeviceType } from "@elgato/schemas/streamdeck/plugins";

export { DeviceType };

/**
 * Provides information for a device.
 */
export type DeviceInfo = {
	/**
	 * Name of the device, as specified by the user in the Stream Deck application.
	 */
	readonly name: string;

	/**
	 * Number of action slots, excluding dials / touchscreens, available to the device.
	 */
	readonly size: Size;

	/**
	 * Type of the device that was connected, e.g. Stream Deck+, Stream Deck Pedal, etc. See {@link DeviceType}.
	 */
	readonly type: DeviceType;
};

/**
 * Size of the Stream Deck device.
 */
export type Size = {
	/**
	 * Number of columns available on the Stream Deck device.
	 */
	readonly columns: number;

	/**
	 * Number of rows available on the Stream Deck device.
	 */
	readonly rows: number;
};
