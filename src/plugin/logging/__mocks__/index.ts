import { LogLevel, Logger, type LoggerOptions } from "../../../common/logging";

const options: LoggerOptions = {
	isDebugMode: false,
	level: LogLevel.TRACE,
	target: { write: jest.fn() }
};

export { LogLevel, Logger };
export const logger = new Logger(options);
