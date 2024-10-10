import path from "node:path";
import { cwd } from "node:process";

import { Logger, LogLevel, type LogTarget, stringFormatter } from "../../common/logging";
import { ConsoleTarget } from "../../common/logging/console-target";
import { getPluginUUID, isDebugMode } from "../common/utils";
import { FileTarget } from "./file-target";

// Log all entires to a log file.
const fileTarget = new FileTarget({
	dest: path.join(cwd(), "logs"),
	fileName: getPluginUUID(),
	format: stringFormatter(),
	maxFileCount: 10,
	maxSize: 50 * 1024 * 1024,
});

// Construct the log targets.
const targets: LogTarget[] = [fileTarget];
if (isDebugMode()) {
	targets.splice(0, 0, new ConsoleTarget());
}

/**
 * Logger responsible for capturing log messages.
 */
export const logger = new Logger({
	level: isDebugMode() ? LogLevel.DEBUG : LogLevel.INFO,
	minimumLevel: isDebugMode() ? LogLevel.TRACE : LogLevel.DEBUG,
	targets,
});

process.once("uncaughtException", (err) => logger.error("Process encountered uncaught exception", err));
