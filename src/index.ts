import * as connectivity from "./connectivity";
import { DeviceCollection } from "./devices";

export { DeviceType, Target } from "./connectivity";
export { LogLevel, default as logger } from "./logger";
export * from "./manifest";
export { client };

const connection = new connectivity.StreamDeckConnection();
const devices = new DeviceCollection(connection);
const client = new connectivity.StreamDeckClient(connection, devices);

connection.connect();
