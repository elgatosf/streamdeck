import type { ProcessInfo } from "./process-info.js";

/**
 * Uses `ps` to list running processes on POSIX-compliant systems (Linux, macOS, BSD, etc.).
 * @returns A promise that resolves to an array of `ProcessInfo` objects representing the currently running processes on the system. Each object contains the PID and the full command line of the process. If the `ps` command fails for any reason, it returns an empty array.
 */
export async function getPosixProcesses(): Promise<ProcessInfo[]> {
	try {
		const { execFile } = await import("node:child_process");
		const { promisify } = await import("node:util");

		const execFileAsync = promisify(execFile);

		const { stdout } = await execFileAsync("ps", ["-ax", "-ww", "-o", "pid=,command="], {
			maxBuffer: 10 * 1024 * 1024,
		});

		return stdout
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => {
				const match = line.match(/^(\d+)\s+(.*)$/);
				return match ? { pid: Number(match[1]), commandLine: match[2] } : undefined;
			})
			.filter((row): row is ProcessInfo => !!row && Number.isFinite(row.pid) && row.pid > 0);
	} catch {
		return [];
	}
}
