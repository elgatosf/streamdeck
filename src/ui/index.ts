import { ConnectElgatoStreamDeckSocketFn, type ActionInfo, type RegistrationInfo } from "../api";
import type { IDisposable } from "../common/disposable";
import { connection } from "./connection";
import * as settings from "./settings";

export { ActionInfo, ConnectElgatoStreamDeckSocketFn, RegistrationInfo } from "../api";
export * from "./events";

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
		connectElgatoStreamDeckSocket?: ConnectElgatoStreamDeckSocketFn;
	}
}

/**
 * @inheritdoc
 */
window.connectElgatoStreamDeckSocket = async (port: string, uuid: string, event: string, info: string, actionInfo: string): Promise<void> => {
	await connection.connect(port, uuid, event, JSON.parse(info), JSON.parse(actionInfo));
};

const streamDeck = {
	/**
	 * Occurs when the UI connects to the Stream Deck.
	 * @param listener Event handler function.
	 * @returns A disposable that removes the listener when disposed.
	 */
	onDidConnect: (listener: (info: RegistrationInfo, actionInfo: ActionInfo) => void): IDisposable => {
		return connection.disposableOn("connected", listener);
	},

	/**
	 * Provides management of settings associated with the Stream Deck plugin.
	 */
	settings
};

export default streamDeck;
