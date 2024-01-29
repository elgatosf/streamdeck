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
 * Stream Deck device types.
 */
export enum DeviceType {
	/**
	 * Stream Deck, comprising of 15 buttons in a 5x3 layout.
	 */
	StreamDeck = 0,

	/**
	 * Stream Deck Mini, comprising of 6 buttons in a 3x2 layout.
	 */
	StreamDeckMini = 1,

	/**
	 * Stream Deck XL, comprising of 32 buttons in an 8x4 layout.
	 */
	StreamDeckXL = 2,

	/**
	 * Stream Deck Mobile for iOS and Android.
	 */
	StreamDeckMobile = 3,

	/**
	 * Corsair G Keys, buttons available on selected Corsair keyboards.
	 */
	CorsairGKeys = 4,

	/**
	 * Stream Deck Pedal.
	 */
	StreamDeckPedal = 5,

	/**
	 * Corsair Voyager laptop, comprising 10 buttons in a horizontal line above the keyboard.
	 */
	CorsairVoyager = 6,

	/**
	 * Stream Deck+, comprising of 8 buttons in a 4x2 layout and 4 dials with accompanying touch screen.
	 */
	StreamDeckPlus = 7
}

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
