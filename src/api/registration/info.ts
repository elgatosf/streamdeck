import type { DeviceInfo } from "../device";
import type { Language } from "../i18n";

/**
 * Object containing information about the Stream Deck application, the plugin, the user's operating system, user's Stream Deck devices, etc.
 */
export type RegistrationInfo = {
	/**
	 * Stream Deck application specific information.
	 */
	readonly application: {
		/**
		 * Font being used by the Stream Deck application.
		 */
		readonly font: string;

		/**
		 * Users preferred language; this is used by the Stream Deck application for localization.
		 */
		readonly language: Language;

		/**
		 * Operating system.
		 */
		readonly platform: "mac" | "windows";

		/**
		 * Operating system version, e.g. "10" for Windows 10.
		 */
		readonly platformVersion: string;

		/**
		 * Stream Deck application version.
		 */
		readonly version: string;
	};

	/**
	 * Collection of preferred colors used by the Stream Deck.
	 */
	readonly colors: {
		/**
		 * Color that denotes the background of a button that is being moused over.
		 */
		readonly buttonMouseOverBackgroundColor: string;

		/**
		 * Color that denotes the background of a pressed button.
		 */
		readonly buttonPressedBackgroundColor: string;

		/**
		 * Color that denotes the border of a press button.
		 */
		readonly buttonPressedBorderColor: string;

		/**
		 * Color that denotes the text of a pressed button.
		 */
		readonly buttonPressedTextColor: string;

		/**
		 * Color of highlighted text.
		 */
		readonly highlightColor: string;
	};

	/**
	 * Pixel ratio, used to identify if the Stream Deck application is running on a high DPI screen.
	 */
	readonly devicePixelRatio: number;

	/**
	 * Devices associated with the Stream Deck application; this may include devices that are not currently connected. Use `"deviceDidConnect"` event to determine which devices are active.
	 */
	readonly devices: [
		DeviceInfo & {
			/**
			 * Unique identifier of the Stream Deck device.
			 */
			readonly id: string;
		}
	];

	/**
	 * Information about the plugin.
	 */
	readonly plugin: {
		/**
		 * Unique identifier of the plugin, as defined by the plugin.
		 */
		readonly uuid: string;

		/**
		 * Version of the plugin.
		 */
		readonly version: string;
	};
};
