import { type ActionInfo, type RegistrationInfo } from "../api";
import type { IDisposable } from "../common/disposable";
import type { JsonObject } from "../common/json";
import "./components";
import { connection } from "./connection";
import "./css/main.css";
import "./css/vars.css";
import { i18n } from "./i18n";
import { logger } from "./logging";
import { plugin } from "./plugin";
import * as settings from "./settings";
import * as system from "./system";

export {
	DeviceType,
	type ActionInfo,
	type ConnectElgatoStreamDeckSocketFn,
	type Controller,
	type RegistrationInfo,
} from "../api";
export { Enumerable } from "../common/enumerable";
export { EventEmitter } from "../common/event-emitter";
export { type JsonObject, type JsonPrimitive, type JsonValue } from "../common/json";
export { LogLevel, type Logger } from "../common/logging";
export {
	type MessageRequestOptions,
	type MessageResponder,
	type MessageResponse,
	type RouteConfiguration,
	type StatusCode,
} from "../common/messaging";
export type * from "./events";
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
	 * Occurs before the UI has established a connection with Stream Deck.
	 * @param listener Event handler function.
	 * @returns A disposable that removes the listener when disposed.
	 */
	onConnecting: <TSettings extends JsonObject = JsonObject>(
		listener: (info: RegistrationInfo, actionInfo: ActionInfo<TSettings>) => void,
	): IDisposable => {
		return connection.disposableOn("connecting", listener);
	},

	/**
	 * Occurs when the UI has established a connection with Stream Deck.
	 * @param listener Event handler function.
	 * @returns A disposable that removes the listener when disposed.
	 */
	onConnected: <TSettings extends JsonObject = JsonObject>(
		listener: (info: RegistrationInfo, actionInfo: ActionInfo<TSettings>) => void,
	): IDisposable => {
		return connection.disposableOn("connected", listener);
	},
};

export default streamDeck;
