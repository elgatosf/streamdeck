import type { ActionEventMessage, Coordinates, SingleActionPayload } from "./action";
import type { PayloadObject } from "./index";

/**
 * Occurs when the user presses a dial (Stream Deck+).
 */
export type DialDown<TSettings extends PayloadObject<TSettings>> = ActionEventMessage<"dialDown", EncoderPayload<TSettings>>;

/**
 * Occurs when the user releases a pressed dial (Stream Deck+).
 */
export type DialUp<TSettings extends PayloadObject<TSettings>> = ActionEventMessage<"dialUp", EncoderPayload<TSettings>>;

/**
 * Occurs when the user rotates a dial (Stream Deck+).
 */
export type DialRotate<TSettings extends PayloadObject<TSettings>> = ActionEventMessage<
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
export type TouchTap<TSettings extends PayloadObject<TSettings>> = ActionEventMessage<
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
type EncoderPayload<TSettings extends PayloadObject<TSettings>> = Pick<SingleActionPayload<TSettings, "Encoder">, "controller" | "settings"> & {
	/**
	 * Coordinates that identify the location of the action.
	 */
	readonly coordinates: Coordinates<0>;
};
