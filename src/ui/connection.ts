import type { ActionInfo, ConnectElgatoStreamDeckSocketFn, RegistrationInfo, UICommand, UIEventMap } from "../api";
import { EventEmitter } from "../common/event-emitter";
import { PromiseCompletionSource } from "../common/promises";

declare global {
	interface Window {
		/**
		 * Connects to the Stream Deck, enabling the UI to interact with the plugin, and access the Stream Deck API.
		 * @param port Port to be used when connecting to Stream Deck.
		 * @param uuid Identifies the UI; this must be provided when establishing the connection with Stream Deck.
		 * @param event Name of the event that identifies the registration procedure; this must be provided when establishing the connection with Stream Deck.
		 * @param info Information about the Stream Deck application and operating system.
		 * @param actionInfo Information about the action the UI is associated with.
		 */
		connectElgatoStreamDeckSocket: ConnectElgatoStreamDeckSocketFn;
	}
}

/**
 * Connection used by the UI to communicate with the plugin, and Stream Deck.
 */
class Connection extends EventEmitter<ExtendedUIEventMap> {
	/**
	 * Determines whether the connection can connect;
	 */
	private canConnect = true;

	/**
	 * Underlying web socket connection.
	 */
	private readonly connection = new PromiseCompletionSource<WebSocket>();

	/**
	 * Underlying connection information provided to the plugin to establish a connection with Stream Deck.
	 */
	private readonly info = new PromiseCompletionSource<ConnectionInfo>();

	/**
	 * Initializes a new instance of the {@link Connection} class.
	 */
	constructor() {
		super();

		window.connectElgatoStreamDeckSocket = ((fn = () => {}) => {
			return async (port: string, uuid: string, event: string, info: string, actionInfo: string): Promise<void> => {
				await this.connect(port, uuid, event, JSON.parse(info), JSON.parse(actionInfo));
				fn(port, uuid, event, info, actionInfo);
			};
		})(window.connectElgatoStreamDeckSocket);
	}

	/**
	 * Gets the connection's information.
	 * @returns The information used to establish the connection.
	 */
	public async getInfo(): Promise<ConnectionInfo> {
		return this.info.promise;
	}

	/**
	 * Sends the commands to the Stream Deck, once the connection has been established and registered.
	 * @param command Command being sent.
	 * @returns `Promise` resolved when the command is sent to Stream Deck.
	 */
	public async send(command: UICommand): Promise<void> {
		const connection = await this.connection.promise;
		const message = JSON.stringify(command);

		connection.send(message);
	}

	/**
	 * Establishes a connection with Stream Deck, allowing for the UI to send and receive messages.
	 * @param port Port to be used when connecting to Stream Deck.
	 * @param uuid Identifies the UI; this must be provided when establishing the connection with Stream Deck.
	 * @param event Name of the event that identifies the registration procedure; this must be provided when establishing the connection with Stream Deck.
	 * @param info Information about the Stream Deck application, the plugin, the user's operating system, user's Stream Deck devices, etc.
	 * @param actionInfo Information for the action associated with the UI.
	 * @returns A promise that is resolved when a connection has been established.
	 */
	private async connect(port: string, uuid: string, event: string, info: RegistrationInfo, actionInfo: ActionInfo): Promise<void> {
		if (this.canConnect) {
			this.canConnect = false;

			const webSocket = new WebSocket(`ws://127.0.0.1:${port}`);
			webSocket.onmessage = (ev: MessageEvent<string>): void => this.tryEmit(ev);
			webSocket.onopen = (): void => {
				webSocket.send(JSON.stringify({ event, uuid }));
				this.connection.setResult(webSocket);

				// As the emitter does not awaiter listeners, we are safe from dead-locking against the listener calling `getInfo()`.
				this.emit("connected", info, actionInfo);
				this.info.setResult({ uuid, info, actionInfo });
			};
		}

		await this.connection.promise;
	}

	/**
	 * Attempts to emit the {@link ev} that was received from the {@link Connection.connection}.
	 * @param ev Event message data received from Stream Deck.
	 */
	private tryEmit(ev: MessageEvent<string>): void {
		const message = JSON.parse(ev.data);
		if (message.event) {
			this.emit(message.event, message);
		}
	}
}

/**
 * Information about the connection with Stream Deck.
 */
export type ConnectionInfo = {
	/**
	 * Unique identifier of the UI.
	 */
	uuid: string;

	/**
	 * Information about the Stream Deck application, the plugin, the user's operating system, user's Stream Deck devices, etc.
	 */
	info: RegistrationInfo;

	/**
	 * Information about the action associated with the UI.
	 */
	actionInfo: ActionInfo;
};

/**
 * An extended event map that includes connection events.
 */
type ExtendedUIEventMap = UIEventMap & {
	/**
	 * Occurs when a connection is established.
	 */
	connected: [info: RegistrationInfo, actionInfo: ActionInfo];
};

export const connection = new Connection();
