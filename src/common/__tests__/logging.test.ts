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

	it("Creates logs directory", async () => {
		// Arrange.
		(fs.existsSync as jest.Mock).mockReturnValue(false);
		const { Logger, LogLevel } = require("../logging") as typeof import("../logging");

		// Act.
		const logger = new Logger();

		// Assert.
		expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
		expect(fs.mkdirSync).toHaveBeenLastCalledWith(path.join(mockedCwd, "logs"));
	});

	it("Can log all levels", async () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);
		(utils.isDebugMode as unknown) = true;

		const { Logger, LogLevel } = require("../logging") as typeof import("../logging");
		const logger = new Logger();

		// Act.
		logger.setLogLevel(LogLevel.TRACE);
		logger.logError("Error");
		logger.logWarn("Warning");
		logger.logInfo("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert.
		expect(fs.writeSync).toHaveBeenCalledTimes(5);
		expect(fs.writeSync).toHaveBeenNthCalledWith(1, mockedFileId, `2000-12-25T10:30:00.123Z ERROR Error${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(2, mockedFileId, `2000-12-25T10:30:00.123Z WARN  Warning${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(3, mockedFileId, `2000-12-25T10:30:00.123Z INFO  Info${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(4, mockedFileId, `2000-12-25T10:30:00.123Z DEBUG Debug${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(5, mockedFileId, `2000-12-25T10:30:00.123Z TRACE Trace${EOL}`);

		expect(fs.closeSync).toHaveBeenCalledTimes(5);
		expect(fs.closeSync).toHaveBeenCalledWith(13);
	});

	it("DEBUG and TRACE require debug mode", async () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);
		(utils.isDebugMode as unknown) = false;

		const { Logger, LogLevel } = require("../logging") as typeof import("../logging");
		const logger = new Logger();

		// Act.
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
	});

	it("Logs from ERROR", async () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);

		const { Logger, LogLevel } = require("../logging") as typeof import("../logging");
		const logger = new Logger();

		// Act.
		logger.setLogLevel(LogLevel.ERROR);
		logger.logError("Error");
		logger.logWarn("Warning");
		logger.logInfo("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert.
		expect(fs.writeSync).toHaveBeenCalledTimes(1);
		expect(fs.writeSync).toHaveBeenNthCalledWith(1, mockedFileId, `2000-12-25T10:30:00.123Z ERROR Error${EOL}`);
	});

	it("Logs from WARN", () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);

		const { Logger, LogLevel } = require("../logging") as typeof import("../logging");
		const logger = new Logger();

		// Act
		logger.setLogLevel(LogLevel.WARN);
		logger.logError("Error");
		logger.logWarn("Warning");
		logger.logInfo("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert.
		expect(fs.writeSync).toHaveBeenCalledTimes(2);
		expect(fs.writeSync).toHaveBeenNthCalledWith(1, mockedFileId, `2000-12-25T10:30:00.123Z ERROR Error${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(2, mockedFileId, `2000-12-25T10:30:00.123Z WARN  Warning${EOL}`);
	});

	it("Logs from INFO", () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);

		const { Logger, LogLevel } = require("../logging") as typeof import("../logging");
		const logger = new Logger();

		// Act.
		logger.setLogLevel(LogLevel.INFO);
		logger.logError("Error");
		logger.logWarn("Warning");
		logger.logInfo("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert.
		expect(fs.writeSync).toHaveBeenCalledTimes(3);
		expect(fs.writeSync).toHaveBeenNthCalledWith(1, mockedFileId, `2000-12-25T10:30:00.123Z ERROR Error${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(2, mockedFileId, `2000-12-25T10:30:00.123Z WARN  Warning${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(3, mockedFileId, `2000-12-25T10:30:00.123Z INFO  Info${EOL}`);
	});

	it("Logs from DEBUG", () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);
		(utils.isDebugMode as unknown) = true;

		const { Logger, LogLevel } = require("../logging") as typeof import("../logging");
		const logger = new Logger();

		// Act.
		logger.setLogLevel(LogLevel.DEBUG);
		logger.logError("Error");
		logger.logWarn("Warning");
		logger.logInfo("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert.
		expect(fs.writeSync).toHaveBeenCalledTimes(4);
		expect(fs.writeSync).toHaveBeenNthCalledWith(1, mockedFileId, `2000-12-25T10:30:00.123Z ERROR Error${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(2, mockedFileId, `2000-12-25T10:30:00.123Z WARN  Warning${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(3, mockedFileId, `2000-12-25T10:30:00.123Z INFO  Info${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(4, mockedFileId, `2000-12-25T10:30:00.123Z DEBUG Debug${EOL}`);
	});

	it("Logs from TRACE", () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);
		(utils.isDebugMode as unknown) = true;

		const { Logger, LogLevel } = require("../logging") as typeof import("../logging");
		const logger = new Logger();

		// Act.
		logger.setLogLevel(LogLevel.TRACE);
		logger.logError("Error");
		logger.logWarn("Warning");
		logger.logInfo("Info");
		logger.logDebug("Debug");
		logger.logTrace("Trace");

		// Assert.
		expect(fs.writeSync).toHaveBeenCalledTimes(5);
		expect(fs.writeSync).toHaveBeenNthCalledWith(1, mockedFileId, `2000-12-25T10:30:00.123Z ERROR Error${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(2, mockedFileId, `2000-12-25T10:30:00.123Z WARN  Warning${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(3, mockedFileId, `2000-12-25T10:30:00.123Z INFO  Info${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(4, mockedFileId, `2000-12-25T10:30:00.123Z DEBUG Debug${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(5, mockedFileId, `2000-12-25T10:30:00.123Z TRACE Trace${EOL}`);
	});

	it("Logs error stack", () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);

		const { Logger } = require("../logging") as typeof import("../logging");
		const logger = new Logger();

		const err = new Error();

		// Act.
		logger.logError("Error", err);

		// Assert.
		expect(fs.writeSync).toHaveBeenCalledTimes(2);
		expect(fs.writeSync).toHaveBeenNthCalledWith(1, mockedFileId, `2000-12-25T10:30:00.123Z ERROR Error${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(2, mockedFileId, `${(<Error>err).stack}${EOL}`);
	});

	it("Logs error stack and message", () => {
		// Arrange.
		jest.spyOn(fs, "existsSync").mockReturnValue(false);

		const { Logger } = require("../logging") as typeof import("../logging");
		const logger = new Logger();

		const err = new Error("Hello world, this is a test");

		// Act.
		logger.logError("Error", err);

		// Assert.
		expect(fs.writeSync).toHaveBeenCalledTimes(3);
		expect(fs.writeSync).toHaveBeenNthCalledWith(1, mockedFileId, `2000-12-25T10:30:00.123Z ERROR Error${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(2, mockedFileId, `Hello world, this is a test${EOL}`);
		expect(fs.writeSync).toHaveBeenNthCalledWith(3, mockedFileId, `${(<Error>err).stack}${EOL}`);
	});

	it("Rotates previous logs", () => {
		// todo.
	});

	it("Truncates and rotates when exceeding max size", () => {
		// todo
	});

	it("Uses plugin UUID as file name", () => {
		// todo
	});
});
