import type { Manifest } from "../../manifest";
import type { EventIdentifier } from "./index";

/**
 * Occurs when a monitored application is launched. Monitored applications can be defined in the `manifest.json` file via the {@link Manifest.ApplicationsToMonitor} property. Also see
 * {@link ApplicationDidTerminate}.
 */
export type ApplicationDidLaunch = ApplicationEvent<"applicationDidLaunch">;

/**
 * Occurs when a monitored application terminates. Monitored applications can be defined in the `manifest.json` file via the {@link Manifest.ApplicationsToMonitor} property. Also see
 * {@link ApplicationDidLaunch}.
 */
export type ApplicationDidTerminate = ApplicationEvent<"applicationDidTerminate">;

/**
 * Occurs when the plugin receives the global settings from the Stream Deck.
 */
export type DidReceiveGlobalSettings<TSettings extends object = object> = EventIdentifier<"didReceiveGlobalSettings"> & {
	/**
	 * Additional information about the event that occurred.
	 */
	readonly payload: {
		/**
		 * Global settings associated with this plugin.
		 */
		settings: TSettings extends [] ? never : TSettings;
	};
};

/**
 * Occurs when the computer wakes up.
 */
export type SystemDidWakeUp = EventIdentifier<"systemDidWakeUp">;

/**
 * Provides information about a monitored application. See {@link ApplicationDidLaunch} and {@link ApplicationDidTerminate}.
 */
type ApplicationEvent<TEvent> = EventIdentifier<TEvent> & {
	/**
	 * Payload containing information about the application that triggered the event.
	 */
	readonly payload: {
		/**
		 * Name of the application that triggered the event.
		 */
		readonly application: string;
	};
};
