import path from "node:path";
import { cwd } from "node:process";

import { LogLevel, Logger, type LogTarget } from "../../common/logging";
import { ConsoleTarget } from "../../common/logging/console-target";
import { getPluginUUID, isDebugMode } from "../common/utils";
import { FileTarget } from "./file-target";
import { format } from "./node-util-formatter";

export { LogLevel, Logger } from "../../common/logging";

// Log all entires to a log file.
const fileTarget = new FileTarget({
	dest: path.join(cwd(), "logs"),
	fileName: getPluginUUID(),
	format,
	maxFileCount: 10,
	maxSize: 50 * 1024 * 1024
});

// Construct the log targets.
const targets: LogTarget[] = [fileTarget];
if (isDebugMode()) {
	targets.splice(0, 0, new ConsoleTarget());
}

/**
 * The default {@link Logger} for the current plugin based on its environment.
 * @returns The default {@link Logger}.
 */
export const logger = new Logger({
	isDebugMode: isDebugMode(),
	level: isDebugMode() ? LogLevel.DEBUG : LogLevel.INFO,
	targets
});

process.once("uncaughtException", (err) => logger.error("Process encountered uncaught exception", err));
