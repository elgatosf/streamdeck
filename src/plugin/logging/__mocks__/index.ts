import { LogLevel } from "../log-level";
import { Logger, type LoggerOptions } from "../logger";

const options: LoggerOptions = {
	level: LogLevel.TRACE,
	target: { write: jest.fn() }
};

export const logger = new Logger(options);
