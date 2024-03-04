import type { DidReceiveGlobalSettings, DidReceiveSettings, GetGlobalSettings, GetSettings, PayloadObject } from "../api";

/**
 * Gets the global settings associated with the plugin.
 * @template T The type of global settings associated with the plugin.
 * @param connection Connection with Stream Deck.
 * @param context Context of the requester.
 * @returns Promise containing the plugin's global settings.
 */
export function getGlobalSettings<T extends PayloadObject<T> = object>(connection: SettingsConnection, context: string): Promise<T> {
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
export function getSettings<T extends PayloadObject<T> = object>(connection: SettingsConnection, context: string): Promise<T> {
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
 * A connection capable of retrieving settings.
 */
type SettingsConnection = {
	on<T extends PayloadObject<T>>(eventName: DidReceiveSettings<T>["event"], listener: (...args: [DidReceiveSettings<T>]) => void): void;
	once<T extends PayloadObject<T>>(eventName: DidReceiveGlobalSettings<T>["event"], listener: (...args: [DidReceiveGlobalSettings<T>]) => void): void;
	removeListener<T extends PayloadObject<T>>(eventName: DidReceiveSettings<T>["event"], listener: (...args: [DidReceiveSettings<T>]) => void): void;
	send(command: GetSettings): Promise<void>;
	send(command: GetGlobalSettings): Promise<void>;
};
