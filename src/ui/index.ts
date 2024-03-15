import { type ActionInfo, type RegistrationInfo } from "../api";
import type { IDisposable } from "../common/disposable";
import { connection } from "./connection";
import * as plugin from "./plugin";
import * as settings from "./settings";
import * as system from "./system";

export { type ActionInfo, type ConnectElgatoStreamDeckSocketFn, type PayloadObject, type RegistrationInfo } from "../api";
export * from "./events";

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
	 * Provides interaction with the plugin.
	 */
	plugin,

	/**
	 * Provides management of settings associated with the Stream Deck plugin.
	 */
	settings,

	/**
	 * Provides events and methods for interacting with the system.
	 */
	system
};

export default streamDeck;
