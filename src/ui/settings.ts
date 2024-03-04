import type { DidReceiveGlobalSettings, DidReceiveSettings, PayloadObject } from "../api";
import type { IDisposable } from "../common/disposable";
import { Action } from "./actions/action";
import { connection } from "./connection";
import type { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "./events";

/**
 * Occurs when the global settings are requested, or when the the global settings were updated by the plugin.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDidReceiveGlobalSettings<T extends PayloadObject<T> = object>(listener: (ev: DidReceiveGlobalSettingsEvent<T>) => void): IDisposable {
	return connection.disposableOn("didReceiveGlobalSettings", (ev: DidReceiveGlobalSettings<T>) =>
		listener({
			settings: ev.payload.settings,
			type: ev.event
		})
	);
}

/**
 * Occurs when the settings associated with an action instance are requested, or when the the settings were updated by the plugin.
 * @template T The type of settings associated with the action.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDidReceiveSettings<T extends PayloadObject<T> = object>(listener: (ev: DidReceiveSettingsEvent<T>) => void): IDisposable {
	return connection.disposableOn("didReceiveSettings", (ev: DidReceiveSettings<T>) =>
		listener({
			action: new Action<T>(ev),
			deviceId: ev.device,
			payload: ev.payload,
			type: ev.event
		})
	);
}
