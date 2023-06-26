import { StreamDeckClient } from "./client";
import { StreamDeckConnection } from "./connectivity/connection";
import { RegistrationInfo } from "./connectivity/registration";
import { getDevices } from "./devices";
import { i18nProvider } from "./i18n";
import { Router } from "./routing";

export { LogLevel, logger } from "./common/logging";
export * from "./connectivity/messages";
export * from "./definitions/client";
export * from "./definitions/layouts";
export * from "./definitions/manifest";
export * from "./events";
export { SingletonAction } from "./routing";
export { client, devices, i18n, info, router };

const connection = new StreamDeckConnection();

/**
 * Information about the plugin, and the Stream Deck application.
 */
const info = connection.registrationParameters.info as Omit<RegistrationInfo, "devices">;

/**
 * Collection of Stream Deck devices.
 */
const devices = getDevices(connection);

/**
 * Main communication entry-point between the plugin, and the Stream Deck.
 */
const client = new StreamDeckClient(connection, devices);

/**
 * Provides routing of events received from the Stream Deck, to specific actions.
 */
const router = new Router(client);

/**
 * Internalization provider for retrieving translations from locally defined resources, see {@link https://docs.elgato.com/sdk/plugins/localization}
 */
const i18n = new i18nProvider(connection.registrationParameters.info.application.language);

connection.connect();
