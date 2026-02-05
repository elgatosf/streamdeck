import { ConsoleTarget, Logger, type LogTarget, stringFormatter } from "@elgato/utils/logging";
import { FileTarget } from "@elgato/utils/logging/file-target.js";
import path from "node:path";
import { cwd } from "node:process";

import { getPluginUUID, isDebugMode } from "../common/utils.js";

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
	level: isDebugMode() ? "debug" : "info",
	minimumLevel: isDebugMode() ? "trace" : "debug",
	targets,
});

process.once("uncaughtException", (err) => logger.error("Process encountered uncaught exception", err));
