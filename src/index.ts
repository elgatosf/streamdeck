/**!
 * @author Elgato
 * @module elgato/streamdeck
 * @license MIT
 * @copyright Copyright (c) 2023 Corsair Memory Inc.
 */
import { ActionsController } from "./actions/actions-controller";
import { StreamDeckClient } from "./client";
import { StreamDeckConnection } from "./connectivity/connection";
import { RegistrationInfo, RegistrationParameters } from "./connectivity/registration";
import { getDevices } from "./devices";
import { I18nProvider } from "./i18n";
import { createLogger } from "./logging";
import { getManifest } from "./manifest";

export { SingletonAction } from "./actions/singleton-action";
export * from "./connectivity/layouts";
export { Target } from "./connectivity/target";
export * from "./events";
export { LogLevel } from "./logging";
export { Manifest } from "./manifest";
export { actions, client, devices, i18n, info, logger, manifest };

/**
 * Local file logger; logs can be found within the plugins directory under the "./logs" folder. Log files are re-indexed at 50MiB, with the 10 most recent log files being retained.
 */
const logger = createLogger();

/**
 * Registration parameters supplied by Stream Deck.
 */
const registrationParameters = new RegistrationParameters(process.argv, logger);

/**
 * Singleton connection used throughout the plugin.
 */
const connection = new StreamDeckConnection(registrationParameters, logger);

/**
 * Information about the plugin, and the Stream Deck application.
 */
const info = registrationParameters.info as Omit<RegistrationInfo, "devices">;

/**
 * Collection of Stream Deck devices.
 */
const devices = getDevices(connection);

/**
 * Main communication entry-point between the plugin, and the Stream Deck.
 */
const client = new StreamDeckClient(connection, devices);

/**
 * Manifest associated with the plugin.
 */
const manifest = getManifest();

/**
 * Provides information about, and methods for interacting with, actions associated with the Stream Deck plugin.
 */
const actions = new ActionsController(client, manifest, logger);

/**
 * Internalization provider for retrieving translations from locally defined resources, see {@link https://docs.elgato.com/sdk/plugins/localization}
 */
const i18n = new I18nProvider(connection.registrationParameters.info.application.language, logger);

connection.connect();
