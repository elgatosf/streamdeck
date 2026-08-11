import { afterEach, describe, expect, test, vi } from "vitest";

import { getProcesses } from "../processes.js";
import * as posix from "../processes/posix.js";
import * as win32 from "../processes/win32.js";

vi.mock("../processes/posix.js");
vi.mock("../processes/win32.js");

describe("getProcesses", () => {
	const originalPlatform = process.platform;

	afterEach(() => {
		Object.defineProperty(process, "platform", { value: originalPlatform });
		vi.resetAllMocks();
	});

	test("calls getWindowsProcesses on win32", async () => {
		Object.defineProperty(process, "platform", { value: "win32" });
		const mockProcesses = [{ pid: 1, commandLine: "test" }];
		vi.mocked(win32.getWindowsProcesses).mockResolvedValue(mockProcesses);

		const result = await getProcesses();

		expect(result).toBe(mockProcesses);
		expect(win32.getWindowsProcesses).toHaveBeenCalledOnce();
		expect(posix.getPosixProcesses).not.toHaveBeenCalled();
	});

	test("calls getPosixProcesses on linux", async () => {
		Object.defineProperty(process, "platform", { value: "linux" });
		const mockProcesses = [{ pid: 1, commandLine: "test" }];
		vi.mocked(posix.getPosixProcesses).mockResolvedValue(mockProcesses);

		const result = await getProcesses();

		expect(result).toBe(mockProcesses);
		expect(posix.getPosixProcesses).toHaveBeenCalledOnce();
		expect(win32.getWindowsProcesses).not.toHaveBeenCalled();
	});

	test("calls getPosixProcesses on darwin", async () => {
		Object.defineProperty(process, "platform", { value: "darwin" });
		const mockProcesses = [{ pid: 1, commandLine: "test" }];
		vi.mocked(posix.getPosixProcesses).mockResolvedValue(mockProcesses);

		const result = await getProcesses();

		expect(result).toBe(mockProcesses);
		expect(posix.getPosixProcesses).toHaveBeenCalledOnce();
		expect(win32.getWindowsProcesses).not.toHaveBeenCalled();
	});

	test("throws on unsupported platform", async () => {
		Object.defineProperty(process, "platform", { value: "unknown" });

		await expect(getProcesses()).rejects.toThrow("Unsupported platform: unknown");
	});
});
