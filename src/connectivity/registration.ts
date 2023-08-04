import type { Logger } from "../common/logging";
import { DeviceInfo } from "./device-info";

/**
 * Defines the type of argument supplied by Stream Deck.
 */
enum Argument {
	/**
	 * Identifies the argument that specifies the web socket port that Stream Deck is listening on.
	 */
	Port = "-port",

	/**
	 * Identifies the argument that supplies information about the Stream Deck and the plugin.
	 */
	Info = "-info",

	/**
	 * Identifies the argument that specifies the unique identifier that can be used when registering the plugin.
	 */
	PluginUUID = "-pluginUUID",

	/**
	 * Identifies the argument that specifies the event to be sent to Stream Deck as part of the registration procedure.
	 */
	RegisterEvent = "-registerEvent"
}

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
	 * Initializes a new instance of the {@link RegistrationParameters} class.
	 * @param args Command line arguments supplied by Stream Deck when launching this plugin, used to parse the required registration parameters.
	 * @param logger Logger responsible for logging messages.
	 */
	constructor(args: string[], logger: Logger) {
		for (let i = 0; i < args.length - 1; i++) {
			const param = args[i];
			const value = args[++i];

			switch (param) {
				case Argument.Port:
					logger.logDebug(`port=${value}`);
					this.port = value;
					break;

				case Argument.PluginUUID:
					logger.logDebug(`pluginUUID=${value}`);
					this.pluginUUID = value;
					break;

				case Argument.RegisterEvent:
					logger.logDebug(`registerEvent=${value}`);
					this.registerEvent = value;
					break;

				case Argument.Info:
					logger.logDebug(`info=${value}`);
					this.info = JSON.parse(value);
					break;

				default:
					i--;
					break;
			}
		}

		const invalidArgs: string[] = [];
		const validate = (name: string, value: unknown) => {
			if (value === undefined) {
				invalidArgs.push(name);
			}
		};

		validate(Argument.Port, this.port);
		validate(Argument.PluginUUID, this.pluginUUID);
		validate(Argument.RegisterEvent, this.registerEvent);
		validate(Argument.Info, this.info);

		if (invalidArgs.length > 0) {
			throw new Error(`Unable to establish a connection with Stream Deck, missing command line arguments: ${invalidArgs.join(", ")}`);
		}
	}
}

/**
 * Languages supported by Stream Deck.
 */
export const supportedLanguages = ["de", "en", "es", "fr", "ja", "zh_CN"] as const;

/**
 * Language supported by Stream Deck
 */
export type Language = (typeof supportedLanguages)[number];

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
