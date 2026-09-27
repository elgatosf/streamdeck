import type { ElementOf } from "../../../utils";
import type { Manifest_7_6 } from "./v7.6";

/**
 * Defines the plugin and available actions, and all information associated with them, including the plugin's entry point, all iconography, action default behavior, etc.
 */
export type Manifest_7_1 = Omit<Manifest_7_6, "Actions" | "Software"> & {
	/**
	 * Collection of actions provided by the plugin, and all of their information; this can include actions that are available to user's via the actions list, and actions that are
	 * hidden to the user but available to pre-defined profiles distributed with the plugin (`Manifest.Actions.VisibleInActionsList`).
	 */
	Actions: (Omit<ElementOf<Manifest_7_6["Actions"]>, "Controllers"> & {
		/**
		 * Defines the controller type the action is applicable to.
		 * - **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2
		 * - **Encoder** refers to a dial / touchscreen on the Stream Deck +.
		 * @uniqueItems
		 */
		Controllers?: [EncoderOrKeypadController, EncoderOrKeypadController?];
	})[];

	/**
	 * Determines the Stream Deck software requirements for this plugin.
	 */
	Software: {
		/**
		 * Minimum version of the Stream Deck application required for this plugin to run.
		 */
		MinimumVersion: "7.1" | "7.2" | "7.3" | "7.4" | "7.5";
	};
};

/**
 * Defines the controller type the action is applicable to.
 * - **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2
 * - **Encoder** refers to a dial / touchscreen on the Stream Deck +.
 */
export type EncoderOrKeypadController = "Encoder" | "Keypad";
