import chalk from "chalk";
import { existsSync, rmSync } from "fs";
import _ from "lodash";

import { command, GlobalOptions } from "../common/command";
import { createConsole, createQuietConsole } from "../common/stdout";
import { defaultConfig, getFilePath, getLocalConfig, updateConfig } from "../config";

/**
 * Lists the configuration.
 */
export const list = command((options, output) => {
	const format = (value: unknown): string => {
		switch (typeof value) {
			case "boolean":
			case "bigint":
			case "number":
				return chalk.yellow(value);
			case "string":
				return chalk.green(value);
			default:
				return chalk.gray(value);
		}
	};

	const log = (value: unknown, key = "", indent = -2): void => {
		if (value instanceof Object) {
			if (key !== "") {
				output.log(`${" ".repeat(indent)}${key}:`);
			}

			Object.entries(value).forEach(([key, value]) => log(value, key, indent + 2));
		} else {
			output.log(`${" ".repeat(indent)}${key}: ${format(value)}`);
		}
	};

	const config = getLocalConfig();
	if (config === undefined) {
		output.info("No local configuration found.");
	} else {
		log(config);
	}
});

/**
 * Resets the local configuration.
 * @param options Options associated with the
 * @param output Output whereby the result will be sent.
 */
export function reset(
	options: GlobalOptions = { quiet: false },
	output = options.quiet ? createQuietConsole() : createConsole(false),
): void {
	const filePath = getFilePath();
	if (existsSync(filePath)) {
		rmSync(filePath);
	}

	output.success("Configuration cleared");
}

/**
 * Sets the configuration for the collection of entries.
 */
export const set = command<SetOptions>((options, output) => {
	let changed = false;
	updateConfig((config, defaultConfig) => {
		[options.entry].concat(options.entries).forEach((entry) => {
			const [path, value] = entry.split("=");

			if (value === undefined) {
				output.warn(`Ignoring undefined value for key ${chalk.yellow(path)}`);
			} else if (typeof _.get(defaultConfig, path) !== "object") {
				_.set(config, path, cast(value, path));
				changed = true;
			} else {
				output.warn(`Ignoring invalid key ${chalk.yellow(path)}`);
			}
		});

		return config;
	});

	if (changed) {
		output.success("Updated configuration");
	}
});

/**
 * Un-sets the configuration entries for the specified keys, resetting to their default values.
 */
export const unset = command<UnsetOptions>((options, output) => {
	let changed = false;
	updateConfig((config, defaultConfig) => {
		new Set<string>(options.keys.concat([options.key])).forEach((path) => {
			if (_.has(defaultConfig, path)) {
				_.unset(config, path);
				changed = true;
			} else {
				output.warn(`Ignoring invalid key ${chalk.yellow(path)}`);
			}
		});
	});

	if (changed) {
		output.success("Updated configuration");
	}
});

/**
 * Attempts cast the specified {@link value} to the correct type. **NB.** only `boolean` are supported as custom types.
 * @param value The value.
 * @param path Path the {@link value} represents.
 * @returns Casted value.
 */
function cast(value: string, path: string): unknown {
	if (typeof _.get(defaultConfig, path) === "boolean") {
		return value.toLowerCase() === "true" || value === "1";
	} else {
		return value;
	}
}

/**
 * Options available to {@link unset}.
 */
type UnsetOptions = {
	/**
	 * Key that identifies the configuration entry.
	 */
	key: string;

	/**
	 * Keys that identify a collection of configuration entries.
	 */
	keys: string[];
};

/**
 * Options available to {@link set}.
 */
type SetOptions = {
	/**
	 * Configuration entry denoted as a key-value-pair separated by an equals sign.
	 */
	entry: string;

	/**
	 * Collection of configuration entries denoted as a key-value-pair separated by an equals sign.
	 */
	entries: string[];
};
