import type { ActionEvent, Controller, Coordinates, SingleActionPayload } from "./action";

/**
 * Occurs when the user presses a dial (Stream Deck+).
 */
export type DialDown<TSettings = unknown> = ActionEvent<"dialDown", EncoderPayload<TSettings>>;

/**
 * Occurs when the user releases a pressed dial (Stream Deck+).
 */
export type DialUp<TSettings = unknown> = ActionEvent<"dialUp", EncoderPayload<TSettings>>;

/**
 * Occurs when the user rotates a dial (Stream Deck+).
 */
export type DialRotate<TSettings = unknown> = ActionEvent<
	"dialRotate",
	EncoderPayload<TSettings> & {
		/**
		 * Determines whether the dial was pressed whilst the rotation occurred.
		 */
		readonly pressed: boolean;

		/**
		 * Number of ticks the dial was rotated; this can be a positive (clockwise) or negative (counter-clockwise) number.
		 */
		readonly ticks: number;
	}
>;

/**
 * Occurs when the user taps the touchscreen (Stream Deck+).
 */
export type TouchTap<TSettings = unknown> = ActionEvent<
	"touchTap",
	EncoderPayload<TSettings> & {
		/**
		 * Determines whether the tap was considered "held".
		 */
		readonly hold: boolean;

		/**
		 * Coordinates of where the touchscreen tap occurred, relative to the canvas of the action.
		 */
		readonly tapPos: [x: number, y: number];
	}
>;

/**
 * Additional information about the action and event that occurred.
 */
type EncoderPayload<TSettings> = Pick<SingleActionPayload<TSettings, Extract<Controller, "Encoder">>, "controller" | "settings"> & {
	/**
	 * Coordinates that identify the location of the action.
	 */
	readonly coordinates: Coordinates<0>;
};
