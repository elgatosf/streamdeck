import type { Manifest } from "./latest";

/**
 * Defines the plugin and available actions, and all information associated with them, including the plugin's entry point, all iconography, action default behavior, etc.
 */
export type Manifest_7_1 = Omit<Manifest, "Software"> & {
	/**
	 * Determines the Stream Deck software requirements for this plugin.
	 */
	Software: {
		/**
		 * Minimum version of the Stream Deck application required for this plugin to run.
		 */
		MinimumVersion: "7.1" | "7.2" | "7.3" | "7.4";
	};
};
