import { DeviceType } from "./connectivity/messages";
import logger from "./logger";

/**
 * Registration information supplied by the Stream Deck when launching the plugin, that enables the plugin to establish a secure connection with the Stream Deck.
 */
export class RegistrationParameters {
	/**
	 * Object containing information about the Stream Deck, this plugin, the user's operating system, user's Stream Deck devices, etc.
	 */
	public readonly info!: RegistrationInfo;

	/**
	 * Unique identifier assigned to the plugin by Stream Deck; this value is used in conjunction with specific commands used to identify the source of the request, e.g. "getGlobalSettings".
	 */
	public readonly pluginUUID!: string;

	/**
	 * Port used by the web socket responsible for communicating messages between the plugin and the Stream Deck.
	 */
	public readonly port!: string;

	/**
	 * Name of the event used as part of the registration procedure when a connection with the Stream Deck is being established.
	 */
	public readonly registerEvent!: string;

	/**
	 * Initializes a new instance of the registration parameters, from the supplied command line arguments arguments.
	 * @param args Command line arguments supplied by Stream Deck when launching this plugin, used to parse the required registration parameters.
	 */
	constructor(args: string[]) {
		for (let i = 0; i < args.length - 1; i++) {
			const param = args[i];
			const value = args[++i];

			if (value === undefined || value === null) {
				throw new Error(`Failed to parse registration information: The ${param} parameter cannot be undefined or null.`);
			}

			switch (param) {
				case "-port":
					this.port = value;
					logger.debug(`port=${value}`);
					break;

				case "-pluginUUID":
					this.pluginUUID = value;
					logger.debug(`pluginUUID=${value}`);
					break;

				case "-registerEvent":
					this.registerEvent = value;
					logger.debug(`registerEvent=${value}`);
					break;

				case "-info":
					this.info = JSON.parse(value);
					logger.debug(`info=${value}`);
					break;

				default:
					i--;
					break;
			}
		}

		if (this.port === undefined) {
			logger.info("no port");
			throw new Error("Unable to establish a connection with Stream Deck: The required command line argument [-port] was not specified by Stream Deck when launching the plugin.");
		}

		if (this.pluginUUID === undefined) {
			logger.info("no plugin UUID");
			throw new Error("Unable to establish a connection with Stream Deck: The required command line argument [-pluginUUID] was not specified by Stream Deck when launching the plugin.");
		}

		if (this.registerEvent === undefined) {
			logger.info("no register event");
			throw new Error("Unable to establish a connection with Stream Deck: The required command line argument [-registerEvent] was not specified by Stream Deck when launching the plugin.");
		}

		if (this.info === undefined) {
			logger.info("no info");
			throw new Error("Unable to establish a connection with Stream Deck: The required command line argument [-info] was not specified by Stream Deck when launching the plugin.");
		}
	}
}

/**
 * Object containing information about the Stream Deck application, the plugin, the user's operating system, user's Stream Deck devices, etc.
 */
export type RegistrationInfo = {
	/**
	 * Stream Deck application specific information.
	 */
	application: {
		/**
		 * Font being used by the Stream Deck application.
		 */
		font: string;

		/**
		 * Users preferred language; this is used by the Stream Deck application for localization.
		 */
		language: "de" | "en" | "es" | "fr" | "ja" | "zh_CN";

		/**
		 * Operating system.
		 */
		platform: "mac" | "windows";

		/**
		 * Operating system version, e.g. "10" for Windows 10.
		 */
		platformVersion: string;

		/**
		 * Stream Deck application version.
		 */
		version: string;
	};

	/**
	 * Collection of preferred colors used by the Stream Deck.
	 */
	colors: {
		/**
		 * Color that denotes the background of a button that is being moused over.
		 */
		buttonMouseOverBackgroundColor: string;

		/**
		 * Color that denotes the background of a pressed button.
		 */
		buttonPressedBackgroundColor: string;

		/**
		 * Color that denotes the border of a press button.
		 */
		buttonPressedBorderColor: string;

		/**
		 * Color that denotes the text of a pressed button.
		 */
		buttonPressedTextColor: string;

		/**
		 * Color of highlighted text.
		 */
		highlightColor: string;
	};

	/**
	 * Pixel ratio, used to identify if the Stream Deck application is running on a high DPI screen.
	 */
	devicePixelRatio: number;

	/**
	 * Devices associated with the Stream Deck application; this may include devices that are not currently connected. Use `"deviceDidConnect"` event to determine which devices are active.
	 */
	devices: [
		{
			/**
			 * Unique identifier of the device.
			 */
			id: string;

			/**
			 * Name of the device, set by the user.
			 */
			name: string;

			/**
			 * Layout size of the device.
			 */
			size: {
				/**
				 * Number of columns associated with the device, e.g. 5 for Stream Deck, 8 for Stream Deck XL, etc.
				 */
				columns: number;

				/**
				 * Number of rows associated with the device, e.g. 3 for Stream Deck, 4 for Stream Deck XL, etc.
				 */
				rows: number;
			};

			/**
			 * Type of the device, e.g. Stream Deck+, Stream Deck XL, etc.
			 */
			type: DeviceType;
		}
	];

	/**
	 * Information about the plugin.
	 */
	plugin: {
		/**
		 * Unique identifier of the plugin, as defined by the plugin.
		 */
		uuid: string;

		/**
		 * Version of the plugin.
		 */
		version: string;
	};
};
