import type { RegistrationInfo } from "../api/index.js";
import { I18nProvider } from "../common/i18n.js";
import { type Logger } from "../common/logging/index.js";
import { actionService, type ActionService } from "./actions/service.js";
import { connection } from "./connection.js";
import { deviceService, type DeviceService } from "./devices/service.js";
import { fileSystemLocaleProvider } from "./i18n.js";
import { logger } from "./logging/index.js";
import * as profiles from "./profiles.js";
import * as settings from "./settings.js";
import * as system from "./system.js";
import { ui, type UIController } from "./ui.js";

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
} from "../api/index.js";
export { type JsonObject, type JsonPrimitive, type JsonValue } from "../common/json.js";
export { LogLevel } from "../common/logging/index.js";
export * from "./actions/index.js";
export * from "./devices/index.js";
export type * from "./events/index.js";
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
