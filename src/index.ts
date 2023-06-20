import { StreamDeckClient } from "./client";
import { StreamDeckConnection } from "./connection";

export * from "./client";
export * from "./enums";
export * from "./events";
export { LogLevel, default as logger } from "./logger";
export * from "./manifest";
export * from "./registration";
export { client };

const connection = new StreamDeckConnection();
const client = new StreamDeckClient(connection);
connection.connect();
