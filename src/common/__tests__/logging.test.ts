import { EOL } from "node:os";
import path from "node:path";

describe("Logger", () => {
	let fs: typeof import("node:fs");
	let utils: typeof import("../utils");

	const mockedCwd = "c:\\temp\\com.elgato.test.sdPlugin";
	const mockedDate = new Date(2000, 11, 25, 10, 30, 0, 123);
	const mockedFileId = 13;

	beforeEach(async () => {
		jest.resetModules();

		jest.doMock("node:fs", () => jest.createMockFromModule("node:fs"));
		fs = await require("node:fs");

		jest.doMock("../utils", () => jest.createMockFromModule("../utils"));
		utils = await require("../utils");

		jest.spyOn(process, "cwd").mockReturnValue(mockedCwd);
		jest.spyOn(fs, "openSync").mockReturnValue(mockedFileId);
		jest.useFakeTimers().setSystemTime(mockedDate);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it.only("Ignores", () => {
		expect(true).toBeTruthy();
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

	it("Can log all levels", async () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);
		(utils.isDebugMode as unknown) = true;

		const { logger, LogLevel } = await require("../logging");
		logger.setLogLevel(LogLevel.TRACE);

		// Act.
		logger.logError("Error");
		logger.logWarn("Warning");
		logger.logInfo("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert.
		expect(jest.isMockFunction(fs.writeSync)).toBeTruthy();
		expect(fs.writeSync).toHaveBeenCalledTimes(5);
		expect(fs.writeSync).toHaveBeenNthCalledWith(1, mockedFileId, `2000-12-25T10:30:00.123Z ERROR Error${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(2, mockedFileId, `2000-12-25T10:30:00.123Z WARN  Warning${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(3, mockedFileId, `2000-12-25T10:30:00.123Z INFO  Info${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(4, mockedFileId, `2000-12-25T10:30:00.123Z DEBUG Debug${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(5, mockedFileId, `2000-12-25T10:30:00.123Z TRACE Trace${EOL}`);

		expect(fs.closeSync).toHaveBeenCalledTimes(5);
		expect(fs.closeSync).toHaveBeenCalledWith(13);
		console.log(logger.logSize);
	});

	it("DEBUG and TRACE require debug mode", async () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);
		(utils.isDebugMode as unknown) = false;

		const { logger, LogLevel } = await require("../logging");

		// Act
		logger.setLogLevel(LogLevel.ERROR);
		logger.setLogLevel(LogLevel.WARN);
		logger.setLogLevel(LogLevel.INFO);
		logger.setLogLevel(LogLevel.DEBUG);
		logger.setLogLevel(LogLevel.TRACE);

		// Assert.
		expect(jest.isMockFunction(fs.writeSync)).toBeTruthy();
		expect(fs.writeSync).toHaveBeenCalledTimes(2);
		expect(fs.writeSync).toHaveBeenNthCalledWith(1, mockedFileId, `2000-12-25T10:30:00.123Z WARN  Log level cannot be set to DEBUG whilst not in debug mode.${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(2, mockedFileId, `2000-12-25T10:30:00.123Z WARN  Log level cannot be set to TRACE whilst not in debug mode.${EOL}`);
		console.log(logger.logSize);
	});

	it("Logs from ERROR", () => {
		fail(); // todo.
	});

	it("Logs from WARN", () => {
		fail(); // todo.
	});

	it("Logs from INFO", () => {
		fail(); // todo.
	});

	it("Logs from DEBUG", () => {
		fail(); // todo.
	});

	it("Logs from TRACE", () => {
		fail(); // todo.
	});

	it("Rotates previous logs", () => {
		fail(); // todo.
	});

	it("Truncates and rotates when exceeding max size", () => {
		fail(); // todo.
	});

	it("Uses plugin UUID as file name", () => {
		fail(); // todo.
	});
});
