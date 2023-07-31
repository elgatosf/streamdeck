import { ActionsController } from "./actions/actions-controller";
import { StreamDeckClient } from "./client";
import { StreamDeckConnection } from "./connectivity/connection";
import { RegistrationInfo } from "./connectivity/registration";
import { getDevices } from "./devices";
import { i18nProvider } from "./i18n";
import { getManifest } from "./manifest";

export { SingletonAction } from "./actions/singleton-action";
export { LogLevel, logger } from "./common/logging";
export * from "./connectivity/layouts";
export { Target } from "./connectivity/target";
export * from "./events";
export { Manifest } from "./manifest";
export { client, devices, i18n, info, manifest, actions as router };

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
 * Manifest associated with the plugin.
 */
const manifest = getManifest();

/**
 * Provides information about, and methods for interacting with, actions associated with the Stream Deck plugin.
 */
const actions = new ActionsController(client, manifest);

/**
 * Internalization provider for retrieving translations from locally defined resources, see {@link https://docs.elgato.com/sdk/plugins/localization}
 */
const i18n = new i18nProvider(connection.registrationParameters.info.application.language);

connection.connect();
