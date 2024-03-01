import { ConnectElgatoStreamDeckSocketFn } from "../api";
import { connection } from "./connection";

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
	console.log("Connecting");
	await connection.connect(port, uuid, event);
	console.log(JSON.parse(info));
	console.log(JSON.parse(actionInfo));
	console.log("Done");
};

export { ActionInfo, ConnectElgatoStreamDeckSocketFn, RegistrationInfo } from "../api";
