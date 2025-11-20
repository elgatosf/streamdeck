import { EventEmitter, withResolvers } from "@elgato/utils";
import WebSocket from "ws";

import type { PluginCommand, PluginEventMap, RegistrationInfo } from "../api/index.js";
import { RegistrationParameter } from "../api/index.js";
import { Version } from "./common/version.js";
import { logger } from "./logging/index.js";

/**
 * Provides a connection between the plugin and the Stream Deck allowing for messages to be sent and received.
 */
class Connection extends EventEmitter<ExtendedEventMap> {
	/**
	 * Private backing field for {@link Connection.registrationParameters}.
	 */
	private _registrationParameters: RegistrationParameters | undefined;

	/**
	 * Private backing field for {@link Connection.version}.
	 */
	private _version: Version | undefined;

	/**
	 * Used to ensure {@link Connection.connect} is invoked as a singleton; `false` when a connection is occurring or established.
	 */
	private canConnect = true;

	/**
	 * Underlying web socket connection.
	 */
	private connection = withResolvers<WebSocket>();

	/**
	 * Logger scoped to the connection.
	 */
	private readonly logger = logger.createScope("Connection");

	/**
	 * Underlying connection information provided to the plugin to establish a connection with Stream Deck.
	 * @returns The registration parameters.
	 */
	public get registrationParameters(): RegistrationParameters {
		return (this._registrationParameters ??= this.getRegistrationParameters());
	}

	/**
	 * Version of Stream Deck this instance is connected to.
	 * @returns The version.
	 */
	public get version(): Version {
		return (this._version ??= new Version(this.registrationParameters.info.application.version));
	}

	/**
	 * Establishes a connection with the Stream Deck, allowing for the plugin to send and receive messages.
	 * @returns A promise that is resolved when a connection has been established.
	 */
	public async connect(): Promise<void> {
		// Ensure we only establish a single connection.
		if (this.canConnect) {
			this.canConnect = false;

			const webSocket = new WebSocket(`ws://127.0.0.1:${this.registrationParameters.port}`);
			webSocket.onmessage = (ev: WebSocket.MessageEvent): void => this.tryEmit(ev);
			webSocket.onopen = (): void => {
				webSocket.send(
					JSON.stringify({
						event: this.registrationParameters.registerEvent,
						uuid: this.registrationParameters.pluginUUID,
					}),
				);

				// Web socket established a connection with the Stream Deck and the plugin was registered.
				this.connection.resolve(webSocket);
				this.emit("connected", this.registrationParameters.info);
			};
		}

		await this.connection.promise;
	}

	/**
	 * Sends the commands to the Stream Deck, once the connection has been established and registered.
	 * @param command Command being sent.
	 * @returns `Promise` resolved when the command is sent to Stream Deck.
	 */
	public async send(command: PluginCommand): Promise<void> {
		const connection = await this.connection.promise;
		const message = JSON.stringify(command);

		this.logger.trace(message);
		connection.send(message);
	}

	/**
	 * Gets the registration parameters, provided by Stream Deck, that provide information to the plugin, including how to establish a connection.
	 * @returns Parsed registration parameters.
	 */
	private getRegistrationParameters(): RegistrationParameters {
		const params: Partial<RegistrationParameters> = {
			port: undefined,
			info: undefined,
			pluginUUID: undefined,
			registerEvent: undefined,
		};

		const scopedLogger = logger.createScope("RegistrationParameters");

		for (let i = 0; i < process.argv.length - 1; i++) {
			const param = process.argv[i];
			const value = process.argv[++i];

			switch (param) {
				case RegistrationParameter.Port:
					scopedLogger.debug(`port=${value}`);
					params.port = value;
					break;

				case RegistrationParameter.PluginUUID:
					scopedLogger.debug(`pluginUUID=${value}`);
					params.pluginUUID = value;
					break;

				case RegistrationParameter.RegisterEvent:
					scopedLogger.debug(`registerEvent=${value}`);
					params.registerEvent = value;
					break;

				case RegistrationParameter.Info:
					scopedLogger.debug(`info=${value}`);
					params.info = JSON.parse(value);
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

		validate(RegistrationParameter.Port, params.port);
		validate(RegistrationParameter.PluginUUID, params.pluginUUID);
		validate(RegistrationParameter.RegisterEvent, params.registerEvent);
		validate(RegistrationParameter.Info, params.info);

		if (invalidArgs.length > 0) {
			throw new Error(
				`Unable to establish a connection with Stream Deck, missing command line arguments: ${invalidArgs.join(", ")}`,
			);
		}

		return params as RegistrationParameters;
	}

	/**
	 * Attempts to emit the {@link ev} that was received from the {@link Connection.connection}.
	 * @param ev Event message data received from Stream Deck.
	 */
	private tryEmit(ev: WebSocket.MessageEvent): void {
		try {
			const message = JSON.parse(ev.data.toString());
			if (message.event) {
				this.logger.trace(ev.data.toString());
				this.emit(message.event, message);
			} else {
				this.logger.warn(`Received unknown message: ${ev.data}`);
			}
		} catch (err) {
			this.logger.error(`Failed to parse message: ${ev.data}`, err);
		}
	}
}

/**
 * Registration information supplied by the Stream Deck when launching the plugin, that enables the plugin to establish a secure connection with the Stream Deck.
 */
type RegistrationParameters = {
	/**
	 * Object containing information about the Stream Deck, this plugin, the user's operating system, user's Stream Deck devices, etc.
	 */
	info: RegistrationInfo;

	/**
	 * Unique identifier assigned to the plugin by Stream Deck; this value is used in conjunction with specific commands used to identify the source of the request, e.g. "getGlobalSettings".
	 */
	pluginUUID: string;

	/**
	 * Port used by the web socket responsible for communicating messages between the plugin and the Stream Deck.
	 */
	port: string;

	/**
	 * Name of the event used as part of the registration procedure when a connection with the Stream Deck is being established.
	 */
	registerEvent: string;
};

/**
 * An extended event map that includes connection events.
 */
type ExtendedEventMap = PluginEventMap & {
	/**
	 * Occurs when a connection is established.
	 */
	connected: [info: RegistrationInfo];
};

export const connection = new Connection();
