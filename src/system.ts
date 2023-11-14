import { StreamDeckConnection } from "./connectivity/connection";
import type { SystemDidWakeUp } from "./connectivity/events";
import { ApplicationDidLaunchEvent, ApplicationDidTerminateEvent, ApplicationEvent, Event, SystemDidWakeUpEvent } from "./events";
import type { Manifest } from "./manifest";

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
	 */
	public onApplicationDidLaunch(listener: (ev: ApplicationDidLaunchEvent) => void): void {
		this.connection.on("applicationDidLaunch", (ev) => listener(new ApplicationEvent(ev)));
	}

	/**
	 * Occurs when a monitored application terminates. Monitored applications can be defined in the manifest via the {@link Manifest.ApplicationsToMonitor} property.
	 * Also see {@link System.onApplicationDidLaunch}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onApplicationDidTerminate(listener: (ev: ApplicationDidTerminateEvent) => void): void {
		this.connection.on("applicationDidTerminate", (ev) => listener(new ApplicationEvent(ev)));
	}

	/**
	 * Occurs when the computer wakes up.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onSystemDidWakeUp(listener: (ev: SystemDidWakeUpEvent) => void): void {
		this.connection.on("systemDidWakeUp", (ev) => listener(new Event<SystemDidWakeUp>(ev)));
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
