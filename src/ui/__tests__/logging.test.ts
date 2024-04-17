/**
 * @jest-environment jsdom
 */

import * as LoggingModule from "../../common/logging";
import { router } from "../plugin";

jest.mock("../../common/logging");
jest.mock("../plugin");

describe("Logging", () => {
	it("constructs a logger", async () => {
		// Arrange, act.
		const spyOnLogger = jest.spyOn(LoggingModule, "Logger");
		const { logger } = (await require("../logging")) as typeof import("../logging");

		// Assert.
		expect(logger).toBe(spyOnLogger.mock.instances[0]);
		expect(spyOnLogger).toHaveBeenCalledTimes(1);
		expect(spyOnLogger).toHaveBeenCalledWith<[LoggingModule.LoggerOptions]>({
			isDebugMode: true,
			level: LoggingModule.LogLevel.TRACE,
			targets: [expect.any(LoggingModule.ConsoleTarget), LoggingModule.createRoutedLogTarget(router)]
		});
	});
});
