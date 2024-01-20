import WebSocket from "ws";
import { EventEmitter } from "../common/event-emitter";

import type { Command } from "../api/command";
import { PromiseCompletionSource } from "../common/promises";
import { Logger } from "../logging";

import { PluginEventMap } from "../api/events";
import { Version } from "../common/version";
import { RegistrationParameters } from "./registration";

/**
 * Creates a new {@link StreamDeckConnection} capable of connecting and communicating with Stream Deck.
 * @param registrationParameters Registration parameters used to establish a connection with the Stream Deck; these are automatically supplied as part of the command line arguments
 * when the plugin is ran by the Stream Deck.
 * @param logger Logger responsible for capturing log entries.
 * @returns A connection with the Stream Deck, in an idle-unconnected state.
 */
export function createConnection(registrationParameters: RegistrationParameters, logger: Logger): StreamDeckConnection {
	return new PluginConnection(registrationParameters, logger);
}

/**
 * Provides a connection between the plugin and the Stream Deck allowing for messages to be sent and received.
 */
export type StreamDeckConnection = PluginConnection;

/**
 * Provides a connection between the plugin and the Stream Deck allowing for messages to be sent and received.
 */
class PluginConnection extends EventEmitter<PluginEventMap> {
	/**
	 * Version of Stream Deck this instance is connected to.
	 */
	public readonly version: Version;

	/**
	 * Used to ensure {@link StreamDeckConnection.connect} is invoked as a singleton; `false` when a connection is occurring or established.
	 */
	private canConnect = true;

	/**
	 * Connection between the plugin and the Stream Deck in the form of a promise; once connected to the Stream Deck and the plugin has been registered, the promised is resolved and
	 * the connection becomes available.
	 */
	private connection = new PromiseCompletionSource<WebSocket>();

	/**
	 * Logger scoped to this class.
	 */
	private readonly logger: Logger;

	/**
	 * Initializes a new instance of the {@link StreamDeckConnection} class.
	 * @param registrationParameters Registration parameters used to establish a connection with the Stream Deck; these are automatically supplied as part of the command line arguments
	 * when the plugin is ran by the Stream Deck.
	 * @param logger Logger responsible for capturing log entries.
	 */
	constructor(
		public readonly registrationParameters: RegistrationParameters,
		logger: Logger
	) {
		super();
		this.logger = logger.createScope("StreamDeckConnection");
		this.version = new Version(registrationParameters.info.application.version);
	}

	/**
	 * Establishes a connection with the Stream Deck, allowing for the plugin to send and receive messages.
	 * @returns A promise that is resolved when a connection has been established.
	 */
	public async connect(): Promise<void> {
		// Ensure we only establish a single connection.
		if (this.canConnect) {
			this.canConnect = false;
			this.logger.debug("Connecting to Stream Deck.");

			const webSocket = new WebSocket(`ws://127.0.0.1:${this.registrationParameters.port}`);
			webSocket.on("error", () => this.resetConnection());
			webSocket.on("close", () => this.resetConnection());
			webSocket.on("message", (data) => this.tryEmit(data));
			webSocket.once("open", () => {
				webSocket.send(
					JSON.stringify({
						event: this.registrationParameters.registerEvent,
						uuid: this.registrationParameters.pluginUUID
					})
				);

				// Web socket established a connection with the Stream Deck and the plugin was registered.
				this.logger.debug("Successfully connected to Stream Deck.");
				this.connection.setResult(webSocket);
			});
		}

		await this.connection.promise;
	}

	/**
	 * Sends the commands to the Stream Deck, once the connection has been established and the plugin registered.
	 * @param command Command being sent.
	 * @returns `Promise` resolved when the command is sent to Stream Deck.
	 */
	public async send(command: Command): Promise<void> {
		const connection = await this.connection.promise;
		const message = JSON.stringify(command);

		this.logger.trace(message);
		connection.send(message);
	}

	/**
	 * Resets the {@link StreamDeckConnection.connection}.
	 */
	private resetConnection(): void {
		this.canConnect = true;

		this.connection.setException();
		this.connection = new PromiseCompletionSource();
	}

	/**
	 * Attempts to emit the {@link data} that was received from the {@link StreamDeckConnection.connection}.
	 * @param data Event message data received from the Stream Deck.
	 */
	private tryEmit(data: WebSocket.RawData): void {
		try {
			const message = JSON.parse(data.toString());
			if (message.event) {
				this.logger.trace(`${data}`);
				this.emit(message.event, message);
			} else {
				this.logger.warn(`Received unknown message: ${data}`);
			}
		} catch (err) {
			this.logger.error(`Failed to parse message: ${data}`, err);
		}
	}
}
