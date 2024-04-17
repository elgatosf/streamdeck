import { ConsoleTarget, LogLevel, Logger, createRoutedLogTarget } from "../common/logging";
import { router } from "./plugin";

/**
 * Logger responsible for capturing log messages.
 */
export const logger = new Logger({
	isDebugMode: true,
	level: LogLevel.TRACE,
	targets: [new ConsoleTarget(), createRoutedLogTarget(router)]
});
