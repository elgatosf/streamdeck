import type { SystemDidWakeUp } from "./api/events";
import type { IDisposable } from "./common/disposable";
import type { StreamDeckConnection } from "./connectivity/connection";
import { ApplicationDidLaunchEvent, ApplicationDidTerminateEvent, ApplicationEvent, DidReceiveDeepLinkEvent, Event, SystemDidWakeUpEvent } from "./events";
import type { Manifest } from "./manifest";
import { requiresVersion } from "./validation";

/**
 * Provides events and methods for interacting with the system, e.g. monitoring applications or when the system wakes, etc.
 */
export class System {
	/**
	 * Initializes a new instance of the {@link System} class.
	 * @param connection Connection with Stream Deck.
	 */
	constructor(private readonly connection: StreamDeckConnection) {}

	/**
	 * Occurs when a monitored application is launched. Monitored applications can be defined in the manifest via the {@link Manifest.ApplicationsToMonitor} property.
	 * Also see {@link System.onApplicationDidTerminate}.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onApplicationDidLaunch(listener: (ev: ApplicationDidLaunchEvent) => void): IDisposable {
		return this.connection.disposableOn("applicationDidLaunch", (ev) => listener(new ApplicationEvent(ev)));
	}

	/**
	 * Occurs when a monitored application terminates. Monitored applications can be defined in the manifest via the {@link Manifest.ApplicationsToMonitor} property.
	 * Also see {@link System.onApplicationDidLaunch}.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onApplicationDidTerminate(listener: (ev: ApplicationDidTerminateEvent) => void): IDisposable {
		return this.connection.disposableOn("applicationDidTerminate", (ev) => listener(new ApplicationEvent(ev)));
	}

	/**
	 * Occurs when a deep-link message is routed to the plugin from Stream Deck. One-way deep-link messages can be sent to plugins from external applications using the URL format
	 * `streamdeck://plugins/message/<PLUGIN_UUID>/{MESSAGE}`.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onDidReceiveDeepLink(listener: (ev: DidReceiveDeepLinkEvent) => void): IDisposable {
		requiresVersion(6.5, this.connection.version, "Receiving deep-link messages");
		return this.connection.disposableOn("didReceiveDeepLink", (ev) => listener(new DidReceiveDeepLinkEvent(ev)));
	}

	/**
	 * Occurs when the computer wakes up.
	 * @param listener Function to be invoked when the event occurs.
	 * @returns A disposable that, when disposed, removes the listener.
	 */
	public onSystemDidWakeUp(listener: (ev: SystemDidWakeUpEvent) => void): IDisposable {
		return this.connection.disposableOn("systemDidWakeUp", (ev) => listener(new Event<SystemDidWakeUp>(ev)));
	}

	/**
	 * Opens the specified `url` in the user's default browser.
	 * @param url URL to open.
	 * @returns `Promise` resolved when the request to open the `url` has been sent to Stream Deck.
	 */
	public openUrl(url: string): Promise<void> {
		return this.connection.send({
			event: "openUrl",
			payload: {
				url
			}
		});
	}
}
