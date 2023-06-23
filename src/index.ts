import * as connectivity from "./connectivity";

export { DeviceType, Target } from "./connectivity";
export { LogLevel, default as logger } from "./logger";
export * from "./manifest";
export { client };

const connection = new connectivity.StreamDeckConnection();
const client = new connectivity.StreamDeckClient(connection);

connection.connect();
