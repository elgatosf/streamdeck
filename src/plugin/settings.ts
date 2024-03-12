import type { DidReceiveGlobalSettings, DidReceiveSettings, PayloadObject } from "../api";
import type { IDisposable } from "../common/disposable";
import { ActionEvent } from "../common/events";
import { Action } from "./actions/action";
import { connection } from "./connection";
import { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "./events";

/**
 * Gets the global settings associated with the plugin. Use in conjunction with {@link setGlobalSettings}.
 * @template T The type of global settings associated with the plugin.
 * @returns Promise containing the plugin's global settings.
 */
export function getGlobalSettings<T extends PayloadObject<T> = object>(): Promise<T> {
	return new Promise((resolve) => {
		connection.once("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) => resolve(ev.payload.settings));
		connection.send({
			event: "getGlobalSettings",
			context: connection.registrationParameters.pluginUUID
		});
	});
}

/**
 * Occurs when the global settings are requested using {@link getGlobalSettings}, or when the the global settings were updated by the property inspector.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDidReceiveGlobalSettings<T extends PayloadObject<T> = object>(listener: (ev: DidReceiveGlobalSettingsEvent<T>) => void): IDisposable {
	return connection.disposableOn("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) => listener(new DidReceiveGlobalSettingsEvent(ev)));
}

/**
 * Occurs when the settings associated with an action instance are requested using {@link Action.getSettings}, or when the the settings were updated by the property inspector.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDidReceiveSettings<T extends PayloadObject<T> = object>(listener: (ev: DidReceiveSettingsEvent<T>) => void): IDisposable {
	return connection.disposableOn("didReceiveSettings", (ev: DidReceiveSettings<T>) => listener(new ActionEvent<DidReceiveSettings<T>, Action<T>>(new Action<T>(ev), ev)));
}

/**
 * Sets the global {@link settings} associated the plugin. **Note**, these settings are only available to this plugin, and should be used to persist information securely. Use in
 * conjunction with {@link getGlobalSettings}.
 * @param settings Settings to save.
 * @returns `Promise` resolved when the global `settings` are sent to Stream Deck.
 * @example
 * streamDeck.settings.setGlobalSettings({
 *   apiKey,
 *   connectedDate: new Date()
 * })
 */
export function setGlobalSettings<T>(settings: T): Promise<void> {
	return connection.send({
		event: "setGlobalSettings",
		context: connection.registrationParameters.pluginUUID,
		payload: settings
	});
}
