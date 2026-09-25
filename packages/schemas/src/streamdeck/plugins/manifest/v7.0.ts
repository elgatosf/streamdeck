import type { Nodejs } from "./latest";
import type { Manifest_7_1 } from "./v7.1";

/**
 * Defines the plugin and available actions, and all information associated with them, including the plugin's entry point, all iconography, action default behavior, etc.
 */
export type Manifest_7_0 = Omit<Manifest_7_1, "Nodejs" | "Software"> & {
	/**
	 * Configuration options for Node.js based plugins.
	 */
	Nodejs?: Omit<Nodejs, "Version"> & {
		/**
		 * Version of Node.js to use.
		 */
		Version: "20";
	};

	/**
	 * Determines the Stream Deck software requirements for this plugin.
	 */
	Software: {
		/**
		 * Minimum version of the Stream Deck application required for this plugin to run.
		 */
		MinimumVersion: "7.0";
	};
};
