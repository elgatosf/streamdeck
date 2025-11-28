import type { IDisposable, JsonObject } from "@elgato/utils";
import { randomUUID } from "node:crypto";

import type { DidReceiveGlobalSettings, DidReceiveSettings } from "../api/index.js";
import { actionStore } from "./actions/store.js";
import { connection } from "./connection.js";
import { ActionEvent } from "./events/action-event.js";
import { DidReceiveGlobalSettingsEvent, type DidReceiveSettingsEvent } from "./events/index.js";
import { requiresVersion } from "./validation.js";

let __useExperimentalMessageIdentifiers = false;

export const settings = {
	/**
	 * Available from Stream Deck 7.1; determines whether message identifiers should be sent when getting
	 * action-instance or global settings.
	 *
	 * When `true`, the did-receive events associated with settings are only emitted when the action-instance
	 * or global settings are changed in the property inspector.
	 * @returns The value.
	 */
	get useExperimentalMessageIdentifiers(): boolean {
		return __useExperimentalMessageIdentifiers;
	},

	/**
	 * Available from Stream Deck 7.1; determines whether message identifiers should be sent when getting
	 * action-instance or global settings.
	 *
	 * When `true`, the did-receive events associated with settings are only emitted when the action-instance
	 * or global settings are changed in the property inspector.
	 */
	set useExperimentalMessageIdentifiers(value: boolean) {
		requiresVersion(7.1, connection.version, "Message identifiers");
		__useExperimentalMessageIdentifiers = value;
	},

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
		return connection.disposableOn("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) => {
			// Do nothing when the global settings were requested.
			if (settings.useExperimentalMessageIdentifiers && ev.id) {
				return;
			}

			listener(new DidReceiveGlobalSettingsEvent(ev));
		});
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
			// Do nothing when the action's settings were requested.
			if (settings.useExperimentalMessageIdentifiers && ev.id) {
				return;
			}

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
