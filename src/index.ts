import { StreamDeckClient } from "./client";
import { StreamDeckConnection } from "./connectivity/connection";
import { RegistrationInfo } from "./connectivity/registration";
import { getDevices } from "./devices";

export { DeviceType, State } from "./connectivity/messages";
export { Target } from "./definitions/client";
export { LogLevel, logger } from "./logging";
export * from "./manifest";
export { SingletonAction } from "./routing";
export { client, devices, info, router };

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

connection.connect();
