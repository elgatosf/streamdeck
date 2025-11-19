import type { JsonObject } from "../../common/json.js";
import type { ActionEventMessage, Coordinates, SingleActionPayload } from "./action.js";
import type { KeyDown, KeyUp } from "./keypad.js";

/**
 * Occurs when the user presses a dial (Stream Deck +). See also {@link DialUp}.
 *
 * NB: For other action types see {@link KeyDown}.
 */
export type DialDown<TSettings extends JsonObject> = ActionEventMessage<"dialDown", EncoderPayload<TSettings>>;

/**
 * Occurs when the user releases a pressed dial (Stream Deck +). See also {@link DialDown}.
 *
 * NB: For other action types see {@link KeyUp}.
 */
export type DialUp<TSettings extends JsonObject> = ActionEventMessage<"dialUp", EncoderPayload<TSettings>>;

/**
 * Occurs when the user rotates a dial (Stream Deck +).
 */
export type DialRotate<TSettings extends JsonObject> = ActionEventMessage<
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
 * Occurs when the user taps the touchscreen (Stream Deck +).
 */
export type TouchTap<TSettings extends JsonObject> = ActionEventMessage<
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
type EncoderPayload<TSettings extends JsonObject> = Pick<
	SingleActionPayload<TSettings, "Encoder">,
	"controller" | "resources" | "settings"
> & {
	/**
	 * Coordinates that identify the location of the action.
	 */
	readonly coordinates: Coordinates;
};
