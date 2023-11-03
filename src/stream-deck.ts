import { ActionsController } from "./actions/actions-controller";
import { StreamDeckClient } from "./client";
import { StreamDeckConnection } from "./connectivity/connection";
import { RegistrationInfo, RegistrationParameters } from "./connectivity/registration";
import { Device, getDevices } from "./devices";
import { I18nProvider } from "./i18n";
import { Logger, createLogger } from "./logging";
import { Manifest, getManifest } from "./manifest";
import { ProfilesController } from "./profiles";
import { System } from "./system";

/**
 * Defines the default export of this library.
 */
export class StreamDeck {
	/**
	 * Private backing field for {@link StreamDeck.actions}.
	 */
	private _actions: ActionsController | undefined;

	/**
	 * Private backing field for {@link StreamDeck.client}.
	 */
	private _client: StreamDeckClient | undefined;

	/**
	 * Private backing field for {@link StreamDeck.connection}.
	 */
	private _connection: StreamDeckConnection | undefined;

	/**
	 * Private backing field for {@link StreamDeck.devices}.
	 */
	private _devices: ReadonlyMap<string, Device> | undefined;

	/**
	 * Private backing field for {@link StreamDeck.i18n}.
	 */
	private _i18n: I18nProvider | undefined;

	/**
	 * Private backing field for {@link StreamDeck.logger}.
	 */
	private _logger: Logger | undefined;

	/**
	 * Private backing field for {@link StreamDeck.manifest}.
	 */
	private _manifest: Manifest | undefined;

	/**
	 * Private backing field for {@link StreamDeck.profiles};
	 */
	private _profiles: ProfilesController | undefined;

	/**
	 * Private backing field for {@link StreamDeck.registrationParameters}
	 */
	private _registrationParameters: RegistrationParameters | undefined;

	/**
	 * Private backing field for {@link StreamDeck.system};
	 */
	private _system: System | undefined;

	/**
	 * Provides information about, and methods for interacting with, actions associated with the Stream Deck plugin.
	 * @returns The {@link ActionsController}.
	 */
	public get actions(): ActionsController {
		return this._actions || (this._actions = new ActionsController(this.client, this.manifest, this.logger));
	}

	/**
	 * Main communication entry-point between the plugin, and the Stream Deck.
	 * @returns The {@link StreamDeckClient}.
	 */
	public get client(): StreamDeckClient {
		return this._client || (this._client = new StreamDeckClient(this.connection, this.devices));
	}

	/**
	 * Collection of known Stream Deck devices associated with the computer.
	 * @returns The collection of {@link Device}.
	 */
	public get devices(): ReadonlyMap<string, Device> {
		if (this._devices === undefined) {
			this._connection = new StreamDeckConnection(this.registrationParameters, this.logger);
			this._devices = getDevices(this._connection);
		}

		return this._devices;
	}

	/**
	 * Internalization provider for retrieving translations from locally defined resources, see {@link https://docs.elgato.com/sdk/plugins/localization}
	 * @returns The {@link I18nProvider}.
	 */
	public get i18n(): I18nProvider {
		return this._i18n || (this._i18n = new I18nProvider(this.registrationParameters.info.application.language, this.manifest, this.logger));
	}

	/**
	 * Information about the plugin, and the Stream Deck application.
	 * @returns The {@link RegistrationInfo}.
	 */
	public get info(): Omit<RegistrationInfo, "devices"> {
		return this.registrationParameters.info;
	}

	/**
	 * Local file logger; logs can be found within the plugins directory under the "./logs" folder. Log files are re-indexed at 50MiB, with the 10 most recent log files being retained.
	 * @returns The {@link Logger}.
	 */
	public get logger(): Logger {
		return this._logger || (this._logger = createLogger());
	}

	/**
	 * Manifest associated with the plugin.
	 * @returns The {@link Manifest}.
	 */
	public get manifest(): Omit<Manifest, "$schema"> {
		return this._manifest || (this._manifest = getManifest());
	}

	/**
	 * Provides interaction with Stream Deck profiles.
	 * @returns The {@link ProfilesController}.
	 */
	public get profiles(): ProfilesController {
		return this._profiles || (this._profiles = new ProfilesController(this.connection));
	}

	/**
	 * Provides events and methods for interacting with the system, e.g. monitoring applications or when the system wakes, etc.
	 * @returns The {@link System}.
	 */
	public get system(): System {
		return this._system || (this._system = new System(this.connection));
	}

	/**
	 * Singleton connection used throughout the plugin.
	 * @returns The {@link StreamDeckConnection}.
	 */
	private get connection(): StreamDeckConnection {
		if (this._connection === undefined) {
			this._connection = new StreamDeckConnection(this.registrationParameters, this.logger);

			if (this._devices === undefined) {
				this._devices = getDevices(this._connection);
			}
		}

		return this._connection;
	}

	/**
	 * Registration parameters supplied to the plugin from Stream Deck.
	 * @returns The {@link RegistrationParameters}
	 */
	private get registrationParameters(): RegistrationParameters {
		return this._registrationParameters || (this._registrationParameters = new RegistrationParameters(process.argv, this.logger));
	}

	/**
	 * Establishes the connection with the Stream Deck.
	 * @returns A promise resolved when the connection was established.
	 */
	public connect(): Promise<void> {
		return this.connection.connect();
	}
}
