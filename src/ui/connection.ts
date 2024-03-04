import type { ActionInfo, RegistrationInfo, UICommand, UIEventMap } from "../api";
import { EventEmitter } from "../common/event-emitter";
import { PromiseCompletionSource } from "../common/promises";

/**
 * Connection used by the UI to communicate with the plugin, and Stream Deck.
 */
class UIConnection extends EventEmitter<ExtendedUIEventMap> {
	/**
	 * Determines whether the connection can connect;
	 */
	private canConnect = true;

	/**
	 * Underlying web socket connection.
	 */
	private readonly connection = new PromiseCompletionSource<WebSocket>();

	/**
	 * Underlying connection information set when a connection is established.
	 */
	private readonly info = new PromiseCompletionSource<ConnectionInfo>();

	/**
	 * Establishes a connection with Stream Deck, allowing for the UI to send and receive messages.
	 * @param port Port to be used when connecting to Stream Deck.
	 * @param uuid Identifies the UI; this must be provided when establishing the connection with Stream Deck.
	 * @param event Name of the event that identifies the registration procedure; this must be provided when establishing the connection with Stream Deck.
	 * @param info Information about the Stream Deck application, the plugin, the user's operating system, user's Stream Deck devices, etc.
	 * @param actionInfo Information for the action associated with the UI.
	 * @returns A promise that is resolved when a connection has been established.
	 */
	public async connect(port: string, uuid: string, event: string, info: RegistrationInfo, actionInfo: ActionInfo): Promise<void> {
		if (this.canConnect) {
			this.canConnect = false;

			const webSocket = new WebSocket(`ws://127.0.0.1:${port}`);
			webSocket.onmessage = (ev: MessageEvent<string>): void => this.tryEmit(ev);
			webSocket.onopen = (): void => {
				webSocket.send(JSON.stringify({ event, uuid }));

				this.info.setResult({ uuid, info, actionInfo });
				this.connection.setResult(webSocket);

				this.emit("connected", info, actionInfo);
			};
		}

		await this.connection.promise;
	}

	/**
	 * Gets the connection's information.
	 * @returns The information used to establish the connection.
	 */
	public async getInfo(): Promise<ConnectionInfo> {
		return this.info.promise;
	}

	/**
	 * Sends the commands to the Stream Deck, once the connection has been established and the UI is registered.
	 * @param command Command being sent.
	 * @returns `Promise` resolved when the command is sent to Stream Deck.
	 */
	public async send(command: UICommand): Promise<void> {
		const connection = await this.connection.promise;
		const message = JSON.stringify(command);

		connection.send(message);
	}

	/**
	 * Attempts to emit the {@link ev} that was received from the {@link UIConnection.connection}.
	 * @param ev Event message data received from the Stream Deck.
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
type ConnectionInfo = {
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

export const connection = new UIConnection();
