import { getPosixProcesses } from "./processes/posix.js";
import type { ProcessInfo } from "./processes/process-info.js";
import { getWindowsProcesses } from "./processes/win32.js";

/**
 * Gets the running processes in a cross-platform way.
 * @returns A promise that resolves to an array of `ProcessInfo` objects representing the currently running processes on the system.
 */
export async function getProcesses(): Promise<ProcessInfo[]> {
	switch (process.platform) {
		case "win32":
			return getWindowsProcesses();
		case "linux":
		case "darwin":
		case "freebsd":
		case "openbsd":
		case "netbsd":
		case "aix":
		case "sunos":
			return getPosixProcesses();
		default:
			throw new Error(`Unsupported platform: ${process.platform}`);
	}
}

export type { ProcessInfo };
