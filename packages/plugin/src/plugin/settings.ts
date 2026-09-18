import type { IDisposable, JsonObject } from "@elgato/utils";
import { randomUUID } from "node:crypto";

import type { DidReceiveGlobalSettings, DidReceiveSettings } from "../api/index.js";
import type { Action } from "./actions/action.js";
import { settingsCache } from "./actions/cache.js";
import { actionConfig } from "./actions/config.js";
import { actionStore } from "./actions/store.js";
import { connection } from "./connection.js";
import { ActionEvent } from "./events/action-event.js";
import { DidReceiveGlobalSettingsEvent, type DidReceiveSettingsEvent } from "./events/index.js";
import { requiresVersion } from "./validation.js";

export const settings = {
	/**
	 * Determines the behavior of when `onDidReceiveSettings` and `onDidReceiveGlobalSettings` are fired.
	 *
	 * - `false` (default) — `onDidReceiveSettings` and `onDidReceiveGlobalSettings` are only fired
	 * after the settings were updated within the property inspector.
	 * - `true` — `onDidReceiveSettings` and `onDidReceiveGlobalSettings` are fired after the settings
	 * were updated within the property inspector, and after calling `action.getSettings()` and
	 * `streamDeck.settings.getGlobalSettings()` respectively.
	 *
	 * This option replaces `useExperimentalMessageIdentifiers`, with inverted behavior.
	 */
	get useLegacySettingsBehavior(): boolean {
		return actionConfig.useLegacySettingsBehavior;
	},

	/**
	 * Determines the behavior of when `onDidReceiveSettings` and `onDidReceiveGlobalSettings` are fired.
	 *
	 * - `false` (default) — `onDidReceiveSettings` and `onDidReceiveGlobalSettings` are only fired
	 * after the settings were updated within the property inspector.
	 * - `true` — `onDidReceiveSettings` and `onDidReceiveGlobalSettings` are fired after the settings
	 * were updated within the property inspector, and after calling `action.getSettings()` and
	 * `streamDeck.settings.getGlobalSettings()` respectively.
	 *
	 * This option replaces `useExperimentalMessageIdentifiers`, with inverted behavior.
	 */
	set useLegacySettingsBehavior(value: boolean) {
		const prev = actionConfig.useLegacySettingsBehavior;
		if (prev === value) {
			return;
		}

		try {
			actionConfig.useLegacySettingsBehavior = value;
			validateSettingsBehavior();

			settingsCache.clear();
		} catch (err) {
			actionConfig.useLegacySettingsBehavior = prev;
			throw err;
		}
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
	 * Occurs when the global settings were updated within the property inspector.
	 *
	 * When `streamDeck.settings.useLegacySettingsBehavior` is set to `true`, this event will also
	 * occur when calling `getGlobalSettings()`.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that removes the listener.
	 */
	onDidReceiveGlobalSettings: <T extends JsonObject = JsonObject>(
		listener: (ev: DidReceiveGlobalSettingsEvent<T>) => void,
	): IDisposable => {
		return connection.disposableOn("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) => {
			// Do nothing when the global settings were requested.
			if (!settings.useLegacySettingsBehavior && ev.id) {
				return;
			}

			listener(new DidReceiveGlobalSettingsEvent(ev));
		});
	},

	/**
	 * Occurs when the settings, associated with an action, were updated within the property inspector.
	 *
	 * When `streamDeck.settings.useLegacySettingsBehavior` is set to `true`, this event will also
	 * occur when calling `getSettings()` on an action.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that removes the listener.
	 */
	onDidReceiveSettings: <T extends JsonObject = JsonObject>(
		listener: (ev: DidReceiveSettingsEvent<T>) => void,
	): IDisposable => {
		return connection.disposableOn("didReceiveSettings", (ev: DidReceiveSettings<T>) => {
			// Do nothing when the action's settings were requested.
			if (!settings.useLegacySettingsBehavior && ev.id) {
				return;
			}

			const action = actionStore.getActionById(ev.context) as Action<T> | undefined;
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

/**
 * Validates the current settings behavior is compatible with the Stream Deck version, and the
 * minimum version defined within the manifest.
 */
export function validateSettingsBehavior(): never | void {
	if (!settings.useLegacySettingsBehavior) {
		requiresVersion(7.1, connection.version, "Default onDidReceiveSettings/onDidReceiveGlobalSettings behavior");
	}
}
