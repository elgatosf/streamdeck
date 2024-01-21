import { ActionClient } from "./actions/client";
import type { Manifest } from "./api/manifest";
import type { RegistrationInfo } from "./api/registration";
import { StreamDeckConnection, createConnection } from "./connectivity/connection";
import { RegistrationParameters } from "./connectivity/registration-parameters";
import { Device, DeviceClient } from "./devices";
import { I18nProvider } from "./i18n";
import { Logger, createLogger } from "./logging";
import { getManifest } from "./manifest";
import { ProfileClient } from "./profiles";
import { SettingsClient } from "./settings/client";
import { System } from "./system";
import { UIClient } from "./ui";

/**
 * Defines the default export of this library.
 */
export class StreamDeck {
	/**
	 * Private backing field for {@link StreamDeck.actions}.
	 */
	private _actions: ActionClient | undefined;

	/**
	 * Private backing field for {@link StreamDeck.connection}.
	 */
	private _connection: StreamDeckConnection | undefined;

	/**
	 * Private backing field for {@link StreamDeck.devices}.
	 */
	private _devices: DeviceClient | undefined;

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
	private _profiles: ProfileClient | undefined;

	/**
	 * Private backing field for {@link StreamDeck.registrationParameters}
	 */
	private _registrationParameters: RegistrationParameters | undefined;

	/**
	 * Private backing field for {@link StreamDeck.settings}.
	 */
	private _settings: SettingsClient | undefined;

	/**
	 * Private backing field for {@link StreamDeck.system};
	 */
	private _system: System | undefined;

	/**
	 * Private backing field for {@link StreamDeck.ui}.
	 */
	private _ui: UIClient | undefined;

	/**
	 * Provides information about, and methods for interacting with, actions associated with the Stream Deck plugin.
	 * @returns The {@link ActionClient}.
	 */
	public get actions(): ActionClient {
		return (this._actions ??= new ActionClient(this.connection, this.manifest, this.settings, this.ui, this.logger));
	}

	/**
	 * Collection of known Stream Deck devices associated with the computer.
	 * @returns The collection of {@link Device}.
	 */
	public get devices(): DeviceClient {
		return (this._devices ??= new DeviceClient(this.connection));
	}

	/**
	 * Internalization provider for retrieving translations from locally defined resources, see {@link https://docs.elgato.com/sdk/plugins/localization}
	 * @returns The {@link I18nProvider}.
	 */
	public get i18n(): I18nProvider {
		return (this._i18n ??= new I18nProvider(this.registrationParameters.info.application.language, this.manifest, this.logger));
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
		return (this._logger ??= createLogger());
	}

	/**
	 * Manifest associated with the plugin.
	 * @returns The {@link Manifest}.
	 */
	public get manifest(): Omit<Manifest, "$schema"> {
		return (this._manifest ??= getManifest());
	}

	/**
	 * Provides interaction with Stream Deck profiles.
	 * @returns The {@link ProfileClient}.
	 */
	public get profiles(): ProfileClient {
		return (this._profiles ??= new ProfileClient(this.connection));
	}

	/**
	 * Provides management of settings associated with the Stream Deck plugin.
	 * @returns The {@link System}.
	 */
	public get settings(): SettingsClient {
		return (this._settings ??= new SettingsClient(this.connection));
	}

	/**
	 * Provides events and methods for interacting with the system, e.g. monitoring applications or when the system wakes, etc.
	 * @returns The {@link System}.
	 */
	public get system(): System {
		return (this._system ??= new System(this.connection));
	}

	/**
	 * Provides interaction with the Stream Deck UI (aka property inspector).
	 * @returns The {@link UIClient}.
	 */
	public get ui(): UIClient {
		return (this._ui ??= new UIClient(this.connection));
	}

	/**
	 * Singleton connection used throughout the plugin.
	 * @returns The {@link StreamDeckConnection}.
	 */
	private get connection(): StreamDeckConnection {
		return (this._connection ??= createConnection(this.registrationParameters, this.logger));
	}

	/**
	 * Registration parameters supplied to the plugin from Stream Deck.
	 * @returns The {@link RegistrationParameters}
	 */
	private get registrationParameters(): RegistrationParameters {
		return (this._registrationParameters ??= new RegistrationParameters(process.argv, this.logger));
	}

	/**
	 * Establishes the connection with the Stream Deck.
	 * @returns A promise resolved when the connection was established.
	 */
	public connect(): Promise<void> {
		if (this._devices === undefined) {
			this._devices = new DeviceClient(this.connection);
		}

		return this.connection.connect();
	}
}
