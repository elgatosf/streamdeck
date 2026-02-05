import { Logger, type LoggerOptions } from "@elgato/utils/logging";
import { vi } from "vitest";

const options: LoggerOptions = {
	level: "trace",
	targets: [{ write: vi.fn() }],
};

export const logger = new Logger(options);
