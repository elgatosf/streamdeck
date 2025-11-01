import { describe, expect, it, vi } from "vitest";

import { ConsoleTarget } from "../console-target";
import { LogLevel } from "../level";

describe("ConsoleTarget", () => {
	/**
	 * Asserts {@link ConsoleTarget.write} logs to the error console.
	 */
	it("Error writes to error", () => {
		// Arrange.
		const target = new ConsoleTarget();
		const spyOnConsoleError = vi.spyOn(console, "error").mockImplementationOnce(() => vi.fn());

		// Act.
		target.write({
			data: ["Hello world"],
			level: LogLevel.ERROR,
			scope: "Test",
		});

		// Assert.
		expect(spyOnConsoleError).toHaveBeenCalledTimes(1);
		expect(spyOnConsoleError).toHaveBeenCalledWith("Hello world");
	});

	/**
	 * Asserts {@link ConsoleTarget.write} logs to the warn console.
	 */
	it("Warn writes to warn", () => {
		// Arrange.
		const target = new ConsoleTarget();
		const spyOnConsoleWarn = vi.spyOn(console, "warn").mockImplementationOnce(() => vi.fn());

		// Act.
		target.write({
			data: ["Hello world"],
			level: LogLevel.WARN,
			scope: "Test",
		});

		// Assert.
		expect(spyOnConsoleWarn).toHaveBeenCalledTimes(1);
		expect(spyOnConsoleWarn).toHaveBeenCalledWith("Hello world");
	});

	/**
	 * Asserts {@link ConsoleTarget.write} logs to the error console.
	 */
	it.each([
		{ name: "Info", level: LogLevel.INFO },
		{ name: "Debug", level: LogLevel.DEBUG },
		{ name: "Trace", level: LogLevel.TRACE },
	])("$name writes to log", ({ level }) => {
		// Arrange.
		const target = new ConsoleTarget();
		const spyOnConsoleLog = vi.spyOn(console, "log").mockImplementationOnce(() => vi.fn());

		// Act.
		target.write({
			data: ["Hello world"],
			level,
			scope: "Test",
		});

		// Assert.
		expect(spyOnConsoleLog).toHaveBeenCalledTimes(1);
		expect(spyOnConsoleLog).toHaveBeenCalledWith("Hello world");
	});
});
