import child_process, {
	ChildProcessByStdio,
	SpawnOptionsWithStdioTuple,
	StdioNull,
	StdioPipe,
} from "node:child_process";
import { platform } from "node:os";
import { Readable } from "node:stream";

/**
 * Runs the specified {@link command}.
 * @param command Command to run.
 * @param options Options used to determine how the {@link command} should be run.
 * @returns The result of running the command. **NB.** when the command is detached, the result is always 0.
 */
export function run(command: string, options?: RunOptions): Promise<number> {
	if (options?.detached) {
		return forget(command, options);
	}

	return new Promise((resolve, reject) => {
		const opts = mergeOptions(options || {}, "pipe");
		const child = child_process.spawn(command, opts);

		// Begin gathering the stderr, and wait for the child process to finish.
		const stderr = stderrReader(child);
		child.on("exit", (code: number) => {
			if (code > 0) {
				stderr.then((value) => {
					console.log(value);
					reject(code);
				});
			} else {
				resolve(0);
			}
		});
	});
}

/**
 * Runs the specified {@link url}.
 * @param url URL to run.
 * @returns The result of running the command.
 */
export function runUrl(url: string): Promise<number> {
	if (platform() === "win32") {
		return run(`start ${url}`);
	} else {
		return run(`open ${url} -g`);
	}
}

/**
 * Spawns the command in a child process and detaches from the process.
 * @param command Command to run.
 * @param options Options used to determine how the {@link command} should be run.
 * @returns Always 0 as the command is run in isolation.
 */
function forget(command: string, options: RunOptions): Promise<number> {
	const opts = mergeOptions(options, "ignore");

	const child = child_process.spawn(command, opts);
	child.unref();

	return Promise.resolve(0);
}

/**
 * Merges the {@link options} with the default options required to spawn the child process.
 * @param options Options supplied to the {@link run} function.
 * @param stderr The desired stderr of the child process.
 * @returns The merged options.
 */
function mergeOptions<T extends StdioNull | StdioPipe>(
	options: RunOptions,
	stderr: T,
): SpawnOptionsWithStdioTuple<StdioNull, StdioNull, T> {
	return {
		...{
			shell: true,
			windowsHide: true,
		},
		...options,
		...{
			stdio: ["ignore", "ignore", stderr],
		},
	};
}

/**
 * Reads the stderr to a buffer, and resolves the promise once it closes.
 * @param process The process whose stderr should be monitored.
 * @returns Buffered stderr as a string.
 */
async function stderrReader(process: ChildProcessByStdio<null, null, Readable>): Promise<string> {
	return new Promise((resolve) => {
		let stderr: ReadonlyArray<Uint8Array> = [];
		process.stderr.on("data", (data) => (stderr = stderr.concat(data)));
		process.stderr.once("close", () => resolve(Buffer.concat(stderr).toString()));
	});
}

/**
 * Defines the options that support running a command via {@link run}.
 */
export type RunOptions = Omit<SpawnOptionsWithStdioTuple<StdioNull, StdioNull, Readable>, "stdio">;
