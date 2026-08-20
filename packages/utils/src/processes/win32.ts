import type { ProcessInfo } from "./process-info.js";

/**
 * Represents the process information retrieved from Windows using PowerShell's `Get-CimInstance`. This type is used to parse the JSON output from PowerShell and extract the relevant fields for the `ProcessInfo` type.
 */
type WindowsProcessInfo = {
	/**
	 * The process ID (PID) of the running process. This is a positive integer that uniquely identifies the process on the system.
	 */
	ProcessId?: number;
	/**
	 * The full command line used to start the process, including the executable name and any arguments. This is a string that may contain spaces and should be treated as a single command line. It can be null for system processes or processes that do not have a command line (e.g., some services).
	 */
	CommandLine?: string | null;
	/**
	 * The `Name` property is included as a fallback for processes that do not have a `CommandLine` (e.g., system processes). It represents the executable name of the process. If both `CommandLine` and `Name` are missing, the command line will be set to an empty string.
	 */
	Name?: string | null;
};

/**
 * Uses PowerShell's `Get-CimInstance` to retrieve process information on Windows. This method is more robust than parsing `tasklist` output and handles command lines with spaces correctly.
 * @returns A promise that resolves to an array of `ProcessInfo` objects representing the currently running processes on a Windows system. Each object contains the PID and the full command line of the process. If the PowerShell command fails for any reason, it returns an empty array.
 */
export async function getWindowsProcesses(): Promise<ProcessInfo[]> {
	const script =
		"[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-CimInstance Win32_Process | Select-Object ProcessId,CommandLine,Name | ConvertTo-Json -Compress";

	try {
		const { execFile } = await import("node:child_process");
		const { promisify } = await import("node:util");

		const execFileAsync = promisify(execFile);

		const { stdout } = await execFileAsync("powershell", ["-NoProfile", "-Command", script], {
			maxBuffer: 10 * 1024 * 1024,
			encoding: "utf8",
		});

		// Normalize output: remove any leading UTF-8 BOM to avoid JSON.parse issues.
		const normalizedStdout = stdout.replace(/^\uFEFF/, "");
		if (!normalizedStdout.trim()) {
			return [];
		}
		const parsed = JSON.parse(normalizedStdout) as Array<WindowsProcessInfo> | WindowsProcessInfo;
		const rows = Array.isArray(parsed) ? parsed : [parsed];
		return rows
			.map((row) => ({
				pid: typeof row.ProcessId === "number" ? row.ProcessId : Number(row.ProcessId),
				commandLine: row.CommandLine ?? row.Name ?? "",
			}))
			.filter((row) => Number.isFinite(row.pid) && row.pid > 0);
	} catch {
		return [];
	}
}
