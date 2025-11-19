import { vi } from "vitest";

import { Logger, type LoggerOptions, LogLevel } from "../../../common/logging/index.js";

const options: LoggerOptions = {
	level: LogLevel.TRACE,
	targets: [{ write: vi.fn() }],
};

export const logger = new Logger(options);
