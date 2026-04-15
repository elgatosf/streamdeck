/**
 * Stream Deck device types.
 */
export enum DeviceType {
	/**
	 * Stream Deck, comprised of 15 customizable LCD keys in a 5 x 3 layout.
	 */
	StreamDeck = 0,

	/**
	 * Stream Deck Mini, comprised of 6 customizable LCD keys in a 3 x 2 layout.
	 */
	StreamDeckMini = 1,

	/**
	 * Stream Deck XL, comprised of 32 customizable LCD keys in an 8 x 4 layout.
	 */
	StreamDeckXL = 2,

	/**
	 * Stream Deck Mobile, for iOS and Android.
	 */
	StreamDeckMobile = 3,

	/**
	 * Corsair G Keys, available on select Corsair keyboards.
	 */
	CorsairGKeys = 4,

	/**
	 * Stream Deck Pedal, comprised of 3 customizable pedals.
	 */
	StreamDeckPedal = 5,

	/**
	 * Corsair Voyager laptop, comprising 10 buttons in a horizontal line above the keyboard.
	 */
	CorsairVoyager = 6,

	/**
	 * Stream Deck +, comprised of 8 customizable LCD keys in a 4 x 2 layout, a touch strip, and 4 dials.
	 */
	StreamDeckPlus = 7,

	/**
	 * SCUF controller G keys, available on select SCUF controllers, for example SCUF Envision.
	 */
	SCUFController = 8,

	/**
	 * Stream Deck Neo, comprised of 8 customizable LCD keys in a 4 x 2 layout, an info bar, and 2 touch points for page navigation.
	 */
	StreamDeckNeo = 9,

	/**
	 * Stream Deck Studio, comprised of 32 customizable LCD keys in a 16 x 2 layout, and 2 dials (1 on either side).
	 */
	StreamDeckStudio = 10,

	/**
	 * Virtual Stream Deck, comprised of 1 to 64 action (on-screen) on a scalable canvas, with a maximum layout of 8 x 8.
	 */
	VirtualStreamDeck = 11,

	/**
	 * High-performance gaming keyboard, with a built-in Stream Deck comprised of 12 customizable LCD keys in a 3 x 4 layout, an LCD screen, and 2 dials.
	 */
	Galleon100SD = 12,

	/**
	 * Stream Deck + XL, comprised of 36 customizable LCD keys in a 9 x 4 layout, a touch strip, and 6 dials.
	 */
	StreamDeckPlusXL = 13
}
