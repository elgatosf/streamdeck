import { type ActionInfo, type RegistrationInfo } from "../api";
import type { IDisposable } from "../common/disposable";
import { connection } from "./connection";
import { i18n } from "./i18n";
import { logger } from "./logging";
import { plugin } from "./plugin";
import * as settings from "./settings";
import * as system from "./system";

export { DeviceType, type ActionInfo, type ConnectElgatoStreamDeckSocketFn, type Controller, type RegistrationInfo } from "../api";
export { EventEmitter } from "../common/event-emitter";
export { type JsonObject, type JsonPrimitive, type JsonValue } from "../common/json";
export { LogLevel, type Logger } from "../common/logging";
export { type MessageRequestOptions, type MessageResponder, type MessageResponse, type RouteConfiguration, type StatusCode } from "../common/messaging";
export * from "./events";
export { type MessageHandler, type MessageRequest } from "./plugin";

const streamDeck = {
	/**
	 * Internalization provider, responsible for managing localizations and translating resources.
	 */
	i18n,

	/**
	 * Logger responsible for capturing log messages.
	 */
	logger,

	/**
	 * Provides interaction with the plugin.
	 */
	plugin,

	/**
	 * Provides management of settings associated with the Stream Deck plugin.
	 */
	settings,

	/**
	 * Provides events and methods for interacting with the system.
	 */
	system,

	/**
	 * Occurs when the UI connects to the Stream Deck.
	 * @param listener Event handler function.
	 * @returns A disposable that removes the listener when disposed.
	 */
	onDidConnect: (listener: (info: RegistrationInfo, actionInfo: ActionInfo) => void): IDisposable => {
		return connection.disposableOn("connected", listener);
	}
};

export default streamDeck;
