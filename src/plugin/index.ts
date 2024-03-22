import type { Manifest, RegistrationInfo } from "../api";
import { getManifest } from "./manifest";

export {
	BarSubType,
	DeviceType,
	Target,
	type Bar,
	type Controller,
	type Coordinates,
	type DeviceInfo,
	type FeedbackPayload,
	type GBar,
	type Language,
	type Manifest,
	type Pixmap,
	type RegistrationInfo,
	type Size,
	type State,
	type Text
} from "../api";
export { EventEmitter, EventsOf } from "../common/event-emitter";
export type { JsonObject, JsonPrimitive, JsonValue } from "../common/json";
export { type MessageHandler, type MessageRequest, type MessageRequestOptions, type MessageResponse, type RouteConfiguration, type StatusCode } from "../common/messaging";
export { Action, ImageOptions, TitleOptions, TriggerDescriptionOptions } from "./actions/action";
export { action } from "./actions/decorators";
export { SingletonAction } from "./actions/singleton-action";
export { Device } from "./devices";
export * from "./events";
export { LogLevel } from "./logging";

import * as actions from "./actions";
import { connection } from "./connection";
import { devices } from "./devices";
import { I18nProvider } from "./i18n";
import { logger, type Logger } from "./logging";
import * as profiles from "./profiles";
import * as settings from "./settings";
import * as system from "./system";
import * as ui from "./ui";

let i18n: I18nProvider | undefined;

export const streamDeck = {
	/**
	 * Namespace for event listeners and functionality relating to Stream Deck actions.
	 * @returns Actions namespace.
	 */
	get actions(): typeof actions {
		return actions;
	},

	/**
	 * Namespace for interacting with Stream Deck devices.
	 * @returns Devices namespace.
	 */
	get devices(): typeof devices {
		return devices;
	},

	/**
	 * Namespace for internalization, including translations, see {@link https://docs.elgato.com/sdk/plugins/localization}.
	 * @returns Internalization provider.
	 */
	get i18n(): I18nProvider {
		return (i18n ??= new I18nProvider(this.info.application.language, this.manifest, this.logger));
	},

	/**
	 * Registration and application information provided by Stream Deck during initialization.
	 * @returns Registration information.
	 */
	get info(): Omit<RegistrationInfo, "devices"> {
		return connection.registrationParameters.info;
	},

	/**
	 * Logger responsible for capturing log messages.
	 * @returns The logger.
	 */
	get logger(): Logger {
		return logger;
	},

	/**
	 * Manifest associated with the plugin, as defined within the `manifest.json` file.
	 * @returns The manifest.
	 */
	get manifest(): Manifest {
		return getManifest();
	},

	/**
	 * Namespace for Stream Deck profiles.
	 * @returns Profiles namespace.
	 */
	get profiles(): typeof profiles {
		return profiles;
	},

	/**
	 * Namespace for persisting settings within Stream Deck.
	 * @returns Settings namespace.
	 */
	get settings(): typeof settings {
		return settings;
	},

	/**
	 * Namespace for interacting with, and receiving events from, the system the plugin is running on.
	 * @returns System namespace.
	 */
	get system(): typeof system {
		return system;
	},

	/**
	 * Namespace for interacting with UI (property inspector) associated with the plugin.
	 * @returns UI namespace.
	 */
	get ui(): typeof ui {
		return ui;
	},

	/**
	 * Connects the plugin to the Stream Deck.
	 * @returns A promise resolved when a connection has been established.
	 */
	connect(): Promise<void> {
		return connection.connect();
	}
};

export default streamDeck;
