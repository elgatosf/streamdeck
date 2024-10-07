import { ConsoleTarget, createRoutedLogTarget, Logger, LogLevel } from "../common/logging";
import { router } from "./plugin";

/**
 * Logger responsible for capturing log messages.
 */
export const logger = new Logger({
	level: LogLevel.DEBUG,
	targets: [new ConsoleTarget(), createRoutedLogTarget(router)],
});
