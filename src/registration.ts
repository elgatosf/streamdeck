import { DeviceType } from "./enums";
import logger from "./logger";

/**
 * Registration information supplied by the Stream Deck when lauching the plugin, that enables the plugin to establish a secure connection with the Stream Deck.
 */
export class RegistrationParameters {
	/**
	 * Port used by the web socket responsible for communicating messages between the plugin and the Stream Deck.
	 */
	public readonly port!: string;

	/**
	 * Unique identifier assigned to the plugin by Stream Deck; this value is used in conjunction with specific commands used to identify the source of the request, e.g. "getGlobalSettings".
	 */
	public readonly pluginUUID!: string;

	/**
	 * Name of the event used as part of the registration procedure when a connection with the Stream Deck is being established.
	 */
	public readonly registerEvent!: string;

	/**
	 * Object containing information about the Stream Deck, this plugin, the user's operating system, user's Stream Deck devices, etc.
	 */
	public readonly info!: RegistrationInfo;

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
			throw new Error("Unable to establish a connection with Stream Deck: The required command line argument [-port] was not specified by Stream Deck when lauching the plugin.");
		}

		if (this.pluginUUID === undefined) {
			logger.info("no plugin UUID");
			throw new Error("Unable to establish a connection with Stream Deck: The required command line argument [-pluginUUID] was not specified by Stream Deck when lauching the plugin.");
		}

		if (this.registerEvent === undefined) {
			logger.info("no register event");
			throw new Error("Unable to establish a connection with Stream Deck: The required command line argument [-registerEvent] was not specified by Stream Deck when lauching the plugin.");
		}

		if (this.info === undefined) {
			logger.info("no info");
			throw new Error("Unable to establish a connection with Stream Deck: The required command line argument [-info] was not specified by Stream Deck when lauching the plugin.");
		}
	}
}

/**
 * Object containing information about the Stream Deck application, the plugin, the user's operating system, user's Stream Deck devices, etc.
 */
export type RegistrationInfo = {
	application: {
		font: string;
		language: "en" | "fr" | "de" | "es" | "ja" | "zh_CN";
		platform: "mac" | "windows";
		platformVersion: string;
		version: string;
	};
	plugin: {
		uuid: string;
		version: string;
	};
	devicePixelRatio: number;
	colors: {
		buttonPressedBackgroundColor: string;
		buttonPressedBorderColor: string;
		buttonPressedTextColor: string;
		disabledColor: string;
		highlightColor: string;
		mouseDownColor: string;
	};
	devices: [
		{
			id: string;
			name: string;
			size: {
				columns: number;
				rows: number;
			};
			type: DeviceType;
		}
	];
};
