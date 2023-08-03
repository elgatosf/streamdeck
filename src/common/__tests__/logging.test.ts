import fs from "node:fs";
import { EOL } from "node:os";
import path from "node:path";

jest.mock("node:fs");

describe("Logger", () => {
	const mockedCwd = "c:\\temp\\com.elgato.test.sdPlugin";
	const mockedDate = new Date(2000, 11, 25, 10, 30, 0, 123);

	beforeAll(() => {
		jest.spyOn(process, "cwd").mockReturnValue(mockedCwd);
		jest.useFakeTimers().setSystemTime(mockedDate);
	});

	afterAll(() => {
		jest.resetAllMocks();
		jest.resetModules();
	});

	it("Creates logs directory", async () => {
		// Arrange.
		(fs.existsSync as jest.Mock).mockReturnValue(false);

		// Act.
		await require("../logging");

		// Assert.
		expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
		expect(fs.mkdirSync).toHaveBeenLastCalledWith(path.join(mockedCwd, "logs"));
	});

	it("Logs info", async () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);
		jest.spyOn(fs, "openSync").mockReturnValue(13);

		const { logger } = await require("../logging");

		// Act.
		logger.logInfo("Hello world");

		// Assert.
		expect(fs.writeSync).toHaveBeenCalledTimes(1);
		expect(fs.writeSync).toHaveBeenCalledWith(13, `2000-12-25T10:30:00.123Z INFO  Hello world${EOL}`);
		expect(fs.closeSync).toHaveBeenCalledWith(13);
	});
});
