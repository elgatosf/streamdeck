import type { DidReceiveGlobalSettings, DidReceiveSettings, GetGlobalSettings, GetSettings, PayloadObject, PluginEventMap } from "../api";
import type { EventEmitter } from "./event-emitter";

/**
 * Gets the global settings associated with the plugin.
 * @template T The type of global settings associated with the plugin.
 * @param connection Connection with Stream Deck.
 * @param context Context of the requester.
 * @returns Promise containing the plugin's global settings.
 */
export function getGlobalSettings<T extends PayloadObject<T> = object>(connection: ISettingsConnection, context: string): Promise<T> {
	return new Promise((resolve) => {
		connection.once("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) => resolve(ev.payload.settings));
		connection.send({
			event: "getGlobalSettings",
			context
		});
	});
}

/**
 * Gets the settings associated with an instance of an action.
 * @template T The type of settings associated with the action.
 * @param connection Connection with Stream Deck.
 * @param context Unique identifier of the action instance whose settings are being requested.
 * @returns Promise containing the action instance's settings.
 */
export function getSettings<T extends PayloadObject<T> = object>(connection: ISettingsConnection, context: string): Promise<T> {
	return new Promise((resolve) => {
		const callback = (ev: DidReceiveSettings<T>): void => {
			if (ev.context == context) {
				resolve(ev.payload.settings);
				connection.removeListener("didReceiveSettings", callback);
			}
		};

		connection.on("didReceiveSettings", callback);
		connection.send({
			event: "getSettings",
			context
		});
	});
}

/**
 * Instance capable of requesting settings.
 */
type SettingsRequester = {
	/**
	 * Sends the commands to the requester.
	 * @param command Command being sent.
	 * @returns `Promise` resolved when the request has been sent.
	 */
	send(command: GetGlobalSettings | GetSettings): Promise<void>;
};

/**
 * Connection with Stream Deck that is capable of interacting with settings.
 */
type ISettingsConnection = EventEmitter<PluginEventMap> & SettingsRequester;
