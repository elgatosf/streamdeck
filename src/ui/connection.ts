import type { UIEventMap } from "../api";
import { EventEmitter } from "../common/event-emitter";
import { PromiseCompletionSource } from "../common/promises";

/**
 * Connection used by the UI to communicate with the plugin, and Stream Deck.
 */
class UIConnection extends EventEmitter<UIEventMap> {
	/**
	 * Determines whether the connection can connect;
	 */
	private canConnect = true;

	/**
	 * Underlying web socket connection.
	 */
	private readonly connection = new PromiseCompletionSource<WebSocket>();

	/**
	 * Establishes a connection with Stream Deck, allowing for the UI to send and receive messages.
	 * @param port Port to be used when connecting to Stream Deck.
	 * @param uuid Identifies the UI; this must be provided when establishing the connection with Stream Deck.
	 * @param event Name of the event that identifies the registration procedure; this must be provided when establishing the connection with Stream Deck.
	 * @returns A promise that is resolved when a connection has been established.
	 */
	public async connect(port: string, uuid: string, event: string): Promise<void> {
		if (this.canConnect) {
			this.canConnect = false;

			const webSocket = new WebSocket(`ws://127.0.0.1:${port}`);
			webSocket.onmessage = (ev: MessageEvent<string>): void => this.tryEmit(ev);
			webSocket.onopen = (): void => {
				webSocket.send(JSON.stringify({ event, uuid }));
				this.connection.setResult(webSocket);
			};
		}

		await this.connection.promise;
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

export const connection = new UIConnection();
