import { StreamDeckConnection } from "./connectivity/connection";
import { RegistrationInfo } from "./connectivity/registration";
import { getDevices } from "./devices";
import { i18nProvider } from "./i18n";
import { StreamDeckClient } from "./interactivity/client";
import { getManifest } from "./manifest";
import { Router } from "./routing/router";

export { LogLevel, logger } from "./common/logging";
export * from "./interactivity/events";
export * from "./interactivity/layouts";
export { Target } from "./interactivity/target";
export { Manifest } from "./manifest";
export { SingletonAction } from "./routing/singleton-action";
export { client, devices, i18n, info, manifest, router };

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
 * Provides routing of events received from the Stream Deck, to specific actions.
 */
const router = new Router(client, manifest);

/**
 * Internalization provider for retrieving translations from locally defined resources, see {@link https://docs.elgato.com/sdk/plugins/localization}
 */
const i18n = new i18nProvider(connection.registrationParameters.info.application.language);

connection.connect();
