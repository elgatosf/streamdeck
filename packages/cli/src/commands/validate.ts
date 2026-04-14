import { resolve } from "node:path";

import { command } from "../common/command";
import { StdoutError } from "../common/stdout";
import { store } from "../common/storage";
import { packageManager } from "../package-manager";
import { validatePlugin } from "../validation/plugin";

/**
 * Key within the store for the value that records the last update check.
 */
const LAST_UPDATE_CHECK_STORE_KEY = "validateSchemasLastUpdateCheck";

/**
 * Default {@link ValidateOptions}.
 */
export const defaultOptions = {
	forceUpdateCheck: false,
	quietSuccess: false,
	path: process.cwd(),
	updateCheck: true,
} satisfies ValidateOptions;

/**
 * Validates the given path, and outputs the results.
 */
export const validate = command<ValidateOptions>(async (options, stdout) => {
	/**
	 * Exits the validation command with a failure.
	 */
	const fail = (): never => {
		if (!options.quietSuccess) {
			stdout.exit(1);
		}

		throw new StdoutError();
	};

	// Check for conflicting options.
	if (!options.updateCheck && options.forceUpdateCheck) {
		console.log(`error: option '--force-update-check' cannot be used with option '--no-update-check'`);
		fail();
	}

	// Determine whether the schemas should be updated.
	if (canUpdateCheck(options)) {
		const update = await packageManager.checkUpdate("@elgato/schemas");
		if (update) {
			await stdout.spin("Updating validation rules", async () => {
				await packageManager.install(update);
				stdout.info(`Validation rules updated`);
			});
		}

		// Log the update check.
		store.set(LAST_UPDATE_CHECK_STORE_KEY, new Date());
	}

	// Validate the plugin and write the output (ignoring success if we should be quiet).
	const result = await validatePlugin(resolve(options.path));
	if (result.hasErrors() || result.hasWarnings() || !options.quietSuccess) {
		result.writeTo(stdout);
	}

	if (result.hasErrors()) {
		fail();
	}
}, defaultOptions);

/**
 * Determines whether an update check can occur for the JSON schemas used to validate files.
 * @param opts Command line options provided when executing the validate command.
 * @returns `true` when an update check can occur; otherwise `false`.
 */
function canUpdateCheck(opts: Required<ValidateOptions>): boolean {
	// Force an update check.
	if (opts.forceUpdateCheck) {
		return true;
	}

	// Prevent an update check.
	if (!opts.updateCheck) {
		return false;
	}

	// Read the store to determine when the last schema update check occurred.
	const prev = store.get(LAST_UPDATE_CHECK_STORE_KEY);
	if (prev === undefined || typeof prev !== "string") {
		return true;
	}

	// Crudely check if the current date differs to the last update check.
	return new Date().toDateString() !== new Date(prev).toDateString();
}

/**
 * Options available to {@link validate}.
 */
export type ValidateOptions = {
	/**
	 * Determines whether an update check **must** happen.
	 */
	readonly forceUpdateCheck?: boolean;

	/**
	 * Path to the plugin to validate.
	 */
	readonly path?: string;

	/**
	 * Determines whether to hide the success message
	 */
	readonly quietSuccess?: boolean;

	/**
	 * Determines whether an update check can occur.
	 */
	readonly updateCheck?: boolean;
};
