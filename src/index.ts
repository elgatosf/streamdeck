import { StreamDeckClient } from "./client";
import { StreamDeckConnection } from "./connectivity/connection";
import { RegistrationInfo } from "./connectivity/registration";
import { getDevices } from "./devices";

export { DeviceType } from "./connectivity/messages";
export { Target } from "./controllers";
export { LogLevel, default as logger } from "./logger";
export * from "./manifest";
export { client, devices, info };

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
