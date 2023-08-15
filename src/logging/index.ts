import path from "node:path";
import { cwd } from "node:process";

import { getPluginUUID, isDebugMode } from "../common/utils";
import { FileTarget } from "./file-target";
import { LogLevel } from "./log-level";
import { LoggerFactory } from "./logger-factory";

export { LogLevel } from "./log-level";

/**
 * Create a {@link LoggerFactory} for the current plugin based on its environment.
 * @returns The {@link LoggerFactory}.
 */
export function createLoggerFactory() {
	const target = new FileTarget({
		dest: path.join(cwd(), "logs"),
		fileName: getPluginUUID(),
		maxFileCount: 10,
		maxSize: 50 * 1024 * 1024
	});

	return new LoggerFactory({
		logLevel: isDebugMode() ? LogLevel.DEBUG : LogLevel.INFO,
		target
	});
}
