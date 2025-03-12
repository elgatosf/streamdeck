import type { Manifest } from "../";
import type { JsonObject } from "../../common/json";
import type { EventIdentifier } from "./index";

/**
 * Occurs when a monitored application is launched. Monitored applications can be defined in the `manifest.json` file via the {@link Manifest.ApplicationsToMonitor} property. See also
 * {@link ApplicationDidTerminate}.
 */
export type ApplicationDidLaunch = ApplicationEventIdentifier<"applicationDidLaunch">;

/**
 * Occurs when a monitored application terminates. Monitored applications can be defined in the `manifest.json` file via the {@link Manifest.ApplicationsToMonitor} property. See also
 * {@link ApplicationDidLaunch}.
 */
export type ApplicationDidTerminate = ApplicationEventIdentifier<"applicationDidTerminate">;

/**
 * Occurs when the plugin receives the global settings from Stream Deck.
 */
export type DidReceiveGlobalSettings<TSettings extends JsonObject> = EventIdentifier<"didReceiveGlobalSettings"> & {
	/**
	 * Additional information about the event that occurred.
	 */
	readonly payload: {
		/**
		 * Global settings associated with this plugin.
		 */
		settings: TSettings;
	};
};

/**
 * Occurs when Stream Deck receives a deep-link message intended for the plugin. The message is re-routed to the plugin, and provided as part of the payload. One-way deep-link message
 * can be routed to the plugin using the URL format `streamdeck://plugins/message/<PLUGIN_UUID>/{MESSAGE}`.
 */
export type DidReceiveDeepLink = EventIdentifier<"didReceiveDeepLink"> & {
	/**
	 * Payload containing information about the URL that triggered the event.
	 */
	readonly payload: {
		/**
		 * The deep-link URL, with the prefix omitted.
		 */
		readonly url: string;
	};
};

/**
 * Occurs when the computer wakes up.
 */
export type SystemDidWakeUp = EventIdentifier<"systemDidWakeUp">;

/**
 * Occurs when the plugin receives secrets from Stream Deck.
 */
export type DidReceiveSecrets<T extends JsonObject> = EventIdentifier<"didReceiveSecrets"> & {
	/**
	 * Payload containing secrets associated with this plugin.
	 */
	readonly payload: {
		/**
		 * Secrets associated with this plugin.
		 */
		secrets: T;
	};
};

/**
 * Provides information about a monitored application. See {@link ApplicationDidLaunch} and {@link ApplicationDidTerminate}.
 */
type ApplicationEventIdentifier<TEvent> = EventIdentifier<TEvent> & {
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
