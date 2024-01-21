import { RegistrationParameter, type RegistrationInfo } from "../../api/registration";
import { type Logger } from "../logging";

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
	 * @param logger Logger responsible for capturing log entries.
	 */
	constructor(args: string[], logger: Logger) {
		const scopedLogger = logger.createScope("RegistrationParameters");

		for (let i = 0; i < args.length - 1; i++) {
			const param = args[i];
			const value = args[++i];

			switch (param) {
				case RegistrationParameter.Port:
					scopedLogger.debug(`port=${value}`);
					this.port = value;
					break;

				case RegistrationParameter.PluginUUID:
					scopedLogger.debug(`pluginUUID=${value}`);
					this.pluginUUID = value;
					break;

				case RegistrationParameter.RegisterEvent:
					scopedLogger.debug(`registerEvent=${value}`);
					this.registerEvent = value;
					break;

				case RegistrationParameter.Info:
					scopedLogger.debug(`info=${value}`);
					this.info = JSON.parse(value);
					break;

				default:
					i--;
					break;
			}
		}

		const invalidArgs: string[] = [];
		const validate = (name: string, value: unknown): void => {
			if (value === undefined) {
				invalidArgs.push(name);
			}
		};

		validate(RegistrationParameter.Port, this.port);
		validate(RegistrationParameter.PluginUUID, this.pluginUUID);
		validate(RegistrationParameter.RegisterEvent, this.registerEvent);
		validate(RegistrationParameter.Info, this.info);

		if (invalidArgs.length > 0) {
			throw new Error(`Unable to establish a connection with Stream Deck, missing command line arguments: ${invalidArgs.join(", ")}`);
		}
	}
}
