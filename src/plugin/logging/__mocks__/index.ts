import { LogLevel, Logger, type LoggerOptions } from "../../../common/logging";

const options: LoggerOptions = {
	level: LogLevel.TRACE,
	targets: [{ write: jest.fn() }]
};

export const logger = new Logger(options);
