/**
 * Represents a running process with its PID and command line.
 */
export type ProcessInfo = {
	/**
	 * The process ID (PID) of the running process. This is a positive integer that uniquely identifies the process on the system.
	 */
	pid: number;
	/**
	 * The full command line used to start the process, including the executable name and any arguments. This is a string that may contain spaces and should be treated as a single command line.
	 */
	commandLine: string;
};
