import { randomUUID } from "node:crypto";

import type { DidReceiveGlobalSettings, DidReceiveSettings } from "../api";
import type { IDisposable } from "../common/disposable";
import { ActionEvent } from "../common/events";
import type { JsonObject } from "../common/json";
import { actionStore } from "./actions/store";
import { connection } from "./connection";
import { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "./events";

export const settings = {
	/**
	 * Gets the global settings associated with the plugin.
	 * @template T The type of global settings associated with the plugin.
	 * @returns Promise containing the plugin's global settings.
	 */
	getGlobalSettings: <T extends JsonObject = JsonObject>(): Promise<T> => {
		return new Promise((resolve) => {
			connection.once("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) => resolve(ev.payload.settings));
			connection.send({
				event: "getGlobalSettings",
				context: connection.registrationParameters.pluginUUID,
				id: randomUUID(),
			});
		});
	},

	/**
	 * Occurs when the global settings are requested, or when the the global settings were updated in
	 * the property inspector.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that removes the listener.
	 */
	onDidReceiveGlobalSettings: <T extends JsonObject = JsonObject>(
		listener: (ev: DidReceiveGlobalSettingsEvent<T>) => void,
	): IDisposable => {
		return connection.disposableOn("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) =>
			listener(new DidReceiveGlobalSettingsEvent(ev)),
		);
	},

	/**
	 * Occurs when the settings associated with an action instance are requested, or when the the settings
	 * were updated in the property inspector.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that removes the listener.
	 */
	onDidReceiveSettings: <T extends JsonObject = JsonObject>(
		listener: (ev: DidReceiveSettingsEvent<T>) => void,
	): IDisposable => {
		return connection.disposableOn("didReceiveSettings", (ev: DidReceiveSettings<T>) => {
			const action = actionStore.getActionById(ev.context);
			if (action) {
				listener(new ActionEvent(action, ev));
			}
		});
	},

	/**
	 * Sets the global settings associated the plugin; these settings are only available to this plugin,
	 * and should be used to persist information securely.
	 * @param settings Settings to save.
	 * @example
	 * streamDeck.settings.setGlobalSettings({
	 *   apiKey,
	 *   connectedDate: new Date()
	 * })
	 */
	setGlobalSettings: async <T extends JsonObject>(settings: T): Promise<void> => {
		await connection.send({
			event: "setGlobalSettings",
			context: connection.registrationParameters.pluginUUID,
			payload: settings,
		});
	},
};
