import type { Manifest, SystemDidWakeUp } from "../api";
import type { DidReceiveSecrets } from "../api/events/system";
import type { IDisposable } from "../common/disposable";
import type { JsonObject } from "../common/json";
import { connection } from "./connection";
import {
	ApplicationDidLaunchEvent,
	ApplicationDidTerminateEvent,
	ApplicationEvent,
	DidReceiveDeepLinkEvent,
	Event,
	SystemDidWakeUpEvent,
} from "./events";
import { requiresVersion } from "./validation";

/**
 * Occurs when a monitored application is launched. Monitored applications can be defined in the manifest via the {@link Manifest.ApplicationsToMonitor} property.
 * See also {@link onApplicationDidTerminate}.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onApplicationDidLaunch(listener: (ev: ApplicationDidLaunchEvent) => void): IDisposable {
	return connection.disposableOn("applicationDidLaunch", (ev) => listener(new ApplicationEvent(ev)));
}

/**
 * Occurs when a monitored application terminates. Monitored applications can be defined in the manifest via the {@link Manifest.ApplicationsToMonitor} property.
 * See also {@link onApplicationDidLaunch}.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onApplicationDidTerminate(listener: (ev: ApplicationDidTerminateEvent) => void): IDisposable {
	return connection.disposableOn("applicationDidTerminate", (ev) => listener(new ApplicationEvent(ev)));
}

/**
 * Occurs when a deep-link message is routed to the plugin from Stream Deck. One-way deep-link messages can be sent to plugins from external applications using the URL format
 * `streamdeck://plugins/message/<PLUGIN_UUID>/{MESSAGE}`.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onDidReceiveDeepLink(listener: (ev: DidReceiveDeepLinkEvent) => void): IDisposable {
	requiresVersion(6.5, connection.version, "Receiving deep-link messages");
	return connection.disposableOn("didReceiveDeepLink", (ev) => listener(new DidReceiveDeepLinkEvent(ev)));
}

/**
 * Occurs when the computer wakes up.
 * @param listener Function to be invoked when the event occurs.
 * @returns A disposable that, when disposed, removes the listener.
 */
export function onSystemDidWakeUp(listener: (ev: SystemDidWakeUpEvent) => void): IDisposable {
	return connection.disposableOn("systemDidWakeUp", (ev) => listener(new Event<SystemDidWakeUp>(ev)));
}

/**
 * Opens the specified `url` in the user's default browser.
 * @param url URL to open.
 * @returns `Promise` resolved when the request to open the `url` has been sent to Stream Deck.
 */
export function openUrl(url: string): Promise<void> {
	return connection.send({
		event: "openUrl",
		payload: {
			url,
		},
	});
}

/**
 * Gets the secrets associated with the plugin.
 * @returns `Promise` resolved with the secrets associated with the plugin.
 */
export function getSecrets<T extends JsonObject = JsonObject>(): Promise<T> {
	return new Promise((resolve) => {
		connection.once("didReceiveSecrets", (ev: DidReceiveSecrets<T>) => resolve(ev.payload.secrets));
		connection.send({
			event: "getSecrets",
			context: connection.registrationParameters.pluginUUID,
		});
	});
}
