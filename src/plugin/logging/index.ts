import path from "node:path";
import { cwd } from "node:process";

import { getPluginUUID, isDebugMode } from "../common/utils";
import { FileTarget } from "./file-target";
import { LogLevel } from "./log-level";
import { Logger } from "./logger";

export { LogLevel } from "./log-level";
export { Logger } from "./logger";

// Log all entires to a log file.
const target = new FileTarget({
	dest: path.join(cwd(), "logs"),
	fileName: getPluginUUID(),
	maxFileCount: 10,
	maxSize: 50 * 1024 * 1024
});

/**
 * The default {@link Logger} for the current plugin based on its environment.
 * @returns The default {@link Logger}.
 */
export const logger = new Logger({
	level: isDebugMode() ? LogLevel.DEBUG : LogLevel.INFO,
	target
});

process.once("uncaughtException", (err) => logger.error("Process encountered uncaught exception", err));
