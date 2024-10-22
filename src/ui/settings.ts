import { ActionInfo, type DidReceiveGlobalSettings, type DidReceiveSettings } from "../api";
import type { IDisposable } from "../common/disposable";
import type { JsonObject, JsonValue } from "../common/json";
import { connection } from "./connection";
import type { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "./events";
import { type SettingSignal, type SettingSignalOptions, SettingSignalProvider } from "./settings/signals";

/**
 * Gets the global settings associated with the plugin. Use in conjunction with {@link setGlobalSettings}.
 * @template T The type of global settings associated with the plugin.
 * @returns Promise containing the plugin's global settings.
 */
export async function getGlobalSettings<T extends JsonObject = JsonObject>(): Promise<T> {
	const { uuid } = await connection.getInfo();

	return new Promise((resolve) => {
		connection.once("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) => resolve(ev.payload.settings));
		connection.send({
			event: "getGlobalSettings",
			context: uuid,
		});
	});
}

/**
 * Gets the settings for the action associated with the UI.
 * @template T The type of settings associated with the action.
 * @returns Promise containing the action instance's settings.
 */
export async function getSettings<T extends JsonObject = JsonObject>(): Promise<T> {
	const {
		uuid,
		actionInfo: { action },
	} = await connection.getInfo();

	return new Promise((resolve) => {
		connection.once("didReceiveSettings", (ev: DidReceiveSettings<T>) => resolve(ev.payload.settings));
		connection.send({
			event: "getSettings",
			action,
			context: uuid,
		});
	});
}

/**
 * Occurs when the global settings are requested, or when the the global settings were updated by the plugin.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDidReceiveGlobalSettings<T extends JsonObject = JsonObject>(
	listener: (ev: DidReceiveGlobalSettingsEvent<T>) => void,
): IDisposable {
	return connection.disposableOn("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) =>
		listener({
			settings: ev.payload.settings,
			type: ev.event,
		}),
	);
}

/**
 * Occurs when the settings associated with an action instance are requested, or when the the settings were updated by the plugin.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDidReceiveSettings<T extends JsonObject = JsonObject>(
	listener: (ev: DidReceiveSettingsEvent<T>) => void,
): IDisposable {
	return connection.disposableOn("didReceiveSettings", (ev: DidReceiveSettings<T>) =>
		listener({
			action: {
				id: ev.context,
				manifestId: ev.action,
				getSettings,
				setSettings,
			},
			payload: ev.payload,
			type: ev.event,
		}),
	);
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
export async function setGlobalSettings<T extends JsonObject>(settings: T): Promise<void> {
	const { uuid } = await connection.getInfo();
	return connection.send({
		event: "setGlobalSettings",
		context: uuid,
		payload: settings,
	});
}

/**
 * Sets the settings for the action associated with the UI.
 * @param settings Settings to persist.
 * @returns `Promise` resolved when the {@link settings} are sent to Stream Deck.
 */
export async function setSettings<T extends JsonObject>(settings: T): Promise<void> {
	const {
		uuid,
		actionInfo: { action },
	} = await connection.getInfo();

	return connection.send({
		event: "setSettings",
		action,
		context: uuid,
		payload: settings,
	});
}

/**
 * Creates a new setting hook for the specified `path`.
 * @param path Path to the setting, for example `name` or `person.name`.
 * @param options Options that define how the setting should function.
 * @returns The setting hook.
 */
export const useSetting = (() => {
	const actionSettings = new SettingSignalProvider("didReceiveSettings", setSettings);
	connection.on("connecting", (_, actionInfo: ActionInfo) => {
		actionSettings.initialize(actionInfo.payload.settings);
	});

	return function <T extends JsonValue>(path: string, options?: SettingSignalOptions<T>): SettingSignal<T> {
		return actionSettings.use(path, options);
	};
})();

/**
 * Creates a new global setting hook for the specified `path`.
 * @param path Path to the global setting, for example `name` or `person.name`.
 * @param options Options that define how the global setting should function.
 * @returns The global setting hook.
 */
export const useGlobalSetting = (() => {
	const globalSettings = new SettingSignalProvider("didReceiveGlobalSettings", setGlobalSettings);
	getGlobalSettings().then((settings) => globalSettings.initialize(settings));

	return function <T extends JsonValue>(path: string, options?: SettingSignalOptions<T>): SettingSignal<T> {
		return globalSettings.use(path, options);
	};
})();
