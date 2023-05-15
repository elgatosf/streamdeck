import { DeviceType } from "./enums";

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
	public readonly event!: string;

	/**
	 * Object containing information about the Stream Deck, this plugin, the user's operating system, user's Stream Deck devices, etc.
	 */
	public readonly info!: RegistrationInfo;

	/**
	 * Initializes a new instance of the registration parameters, from the supplied command line arguments arguments.
	 * @param args Command line arguments supplied by Stream Deck when launching this plugin, used to parse the required registration parameters.
	 */
	constructor(args: string[]) {
		if (args.length !== 8) {
			throw new Error(`Failed to parse registration information: The supplied number of arguments is invalid, expected 8 but was ${args.length}.`);
		}

		for (let i = 0; i < args.length - 1; i++) {
			const param = args[i];
			const value = args[++i];

			if (value === undefined || value === null) {
				throw new Error(`Failed to parse registration information: The ${param} parameter cannot be undefined or null.`);
			}

			switch (param) {
				case "-port":
					this.port = value;
					break;

				case "-pluginUUID":
					this.pluginUUID = value;
					break;

				case "-registerEvent":
					this.event = value;
					break;

				case "-info":
					this.info = JSON.parse(value);
					break;

				default:
					i--;
					break;
			}
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
