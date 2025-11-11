import type { RegistrationInfo } from "../api";
import { I18nProvider } from "../common/i18n";
import { type Logger } from "../common/logging";
import { actionService, type ActionService } from "./actions/service";
import { connection } from "./connection";
import { deviceService, type DeviceService } from "./devices/service";
import { fileSystemLocaleProvider } from "./i18n";
import { logger } from "./logging";
import * as profiles from "./profiles";
import { settings } from "./settings";
import * as system from "./system";
import { ui, type UIController } from "./ui";

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
	type Text,
} from "../api";
export { Enumerable } from "../common/enumerable";
export { EventEmitter, EventsOf } from "../common/event-emitter";
export { type JsonObject, type JsonPrimitive, type JsonValue } from "../common/json";
export { LogLevel } from "../common/logging";
export * from "./actions";
export * from "./devices";
export type * from "./events";
export { type Logger, type UIController };

let i18n: I18nProvider | undefined;

export const streamDeck = {
	/**
	 * Namespace for event listeners and functionality relating to Stream Deck actions.
	 * @returns Actions namespace.
	 */
	get actions(): ActionService {
		return actionService;
	},

	/**
	 * Namespace for interacting with Stream Deck devices.
	 * @returns Devices namespace.
	 */
	get devices(): DeviceService {
		return deviceService;
	},

	/**
	 * Internalization provider, responsible for managing localizations and translating resources.
	 * @returns Internalization provider.
	 */
	get i18n(): I18nProvider {
		return (i18n ??= new I18nProvider(this.info.application.language, fileSystemLocaleProvider));
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
	get ui(): UIController {
		return ui;
	},

	/**
	 * Connects the plugin to the Stream Deck.
	 * @returns A promise resolved when a connection has been established.
	 */
	connect(): Promise<void> {
		return connection.connect();
	},
};

export default streamDeck;
