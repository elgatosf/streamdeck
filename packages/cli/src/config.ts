import Ajv, { JTDSchemaType } from "ajv/dist/jtd";
import chalk from "chalk";
import _ from "lodash";
import logSymbols from "log-symbols";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";

import { packageManager } from "./package-manager";

let __config: Config | undefined = undefined;

/**
 * Default configuration.
 */
export const defaultConfig: Config = Object.freeze({
	npm: {
		cli: {
			mode: "prod" as const,
			version: `^${packageManager.getVersion()}`,
		},
		streamDeck: {
			mode: "prod" as const,
			version: "^2.0.0",
		},
	},
	reduceMotion: false,
	packageManager: "npm",
});

/**
 * Gets the configuration.
 * @returns The configuration.
 */
export function getConfig(): Config {
	if (__config === undefined) {
		__config = _.merge({}, defaultConfig, getLocalConfig() || {});

		const setVersion = (dependency: DependencyConfig, prod: DependencyConfig): void => {
			dependency.version = dependency.mode === "prod" ? prod.version : dependency.version;
		};

		setVersion(__config.npm.cli, defaultConfig.npm.cli);
		setVersion(__config.npm.streamDeck, defaultConfig.npm.streamDeck);
	}

	return __config;
}

/**
 * Gets the local configuration.
 * @returns The local configuration; otherwise undefined.
 */
export function getLocalConfig(): Config | undefined {
	// Check if a config file exists.
	const filePath = getFilePath();
	if (!existsSync(filePath)) {
		return undefined;
	}

	try {
		// Read the local configuration file.
		const contents = readFileSync(filePath, { encoding: "utf-8" });
		const localConfig = contents === "" ? {} : JSON.parse(contents);

		validate(localConfig);
		return localConfig as Config;
	} catch (err) {
		if (err instanceof Error) {
			exitWithError(err.message);
		} else {
			exitWithError("Failed to read local configuration file");
		}
	}
}

/**
 * Updates the configuration.
 * @param updater Function responsible for updating the configuration.
 */
export function updateConfig(updater: (config: object, defaultConfig: Config) => void): void {
	// Read the local configuration.
	const filePath = getFilePath();
	const localConfig = getLocalConfig() || {};

	// Invoke the updater.
	updater(localConfig, defaultConfig);
	validate(localConfig);

	// Write the local configuration.
	if (!existsSync(dirname(filePath))) {
		mkdirSync(dirname(filePath), { recursive: true });
	}

	writeFileSync(filePath, JSON.stringify(localConfig), { encoding: "utf-8" });

	// Update the in-memory configuration.
	if (__config === undefined) {
		__config = _.merge({}, defaultConfig, localConfig || {});
	} else {
		_.merge(__config, defaultConfig, localConfig);
	}
}

/**
 * Gets the path to the local configuration file.
 * @returns Configuration file path.
 */
export function getFilePath(): string {
	if (platform() === "win32") {
		const appData = process.env.APPDATA ?? join(homedir(), "AppData/Roaming");
		return join(appData, "Elgato/MakerCLI/config.json");
	} else {
		return join(homedir(), ".config/com.elgato/maker-cli/config.json");
	}
}

/**
 * Exits the current process due to an invalid set of configuration.
 * @param message Error message.
 * @param errors Supporting error details that highlight the specified of the error that occurred.
 */
function exitWithError(message: string, errors?: string[]): never {
	console.log(`${logSymbols.error} ${message}`);

	if (errors) {
		console.log();
		errors.forEach((err) => console.log(chalk.yellow(err)));
	}

	console.log();
	console.log(
		`Please repair the configuration file or run ${chalk.cyan("streamdeck config reset")} to reset all configuration values.`,
	);
	console.log();
	console.log(getFilePath());

	process.exit(1);
}

/**
 * Validates a configuration object to ensure it fulfils the {@link Config} type.
 */
const validateSchema = new Ajv({ allErrors: true }).compile({
	additionalProperties: true,
	optionalProperties: {
		npm: {
			additionalProperties: true,
			optionalProperties: {
				cli: {
					additionalProperties: true,
					optionalProperties: {
						mode: { enum: ["dev", "prod"] },
						version: { type: "string" },
					},
				},
				streamDeck: {
					additionalProperties: true,
					optionalProperties: {
						mode: { enum: ["dev", "prod"] },
						version: { type: "string" },
					},
				},
			},
		},
		reduceMotion: { type: "boolean" },
		packageManager: { enum: ["npm", "yarn", "pnpm", "bun"] },
	},
} satisfies JTDSchemaType<DeepPartial<Config>>);

/**
 * Validates the specified {@link config}.
 * @param config Configuration to validate.
 */
function validate(config: unknown): never | void {
	if (validateSchema(config)) {
		return;
	}

	exitWithError(
		"Invalid configuration",
		validateSchema.errors?.map(({ instancePath, message, params: { allowedValues } }) => {
			const detail = allowedValues ? `: ${allowedValues.join(", ")}` : "";
			return `[${instancePath.replaceAll("/", ".").substring(1)}] ${message}${detail}`;
		}),
	);
}

/**
 * Stream Deck CLI configuration.
 */
export type Config = {
	/**
	 * Defines the preferred npm dependencies to use when developing.
	 */
	npm: {
		/**
		 * The preferred `@elgato/cli` dependency to use.
		 */
		cli: DependencyConfig;

		/**
		 * The preferred `@elgato/streamdeck` dependency to use.
		 */
		streamDeck: DependencyConfig;
	};

	/**
	 * Determines whether the standard output stream should display non-essential motion, e.g. spinning bars.
	 */
	reduceMotion: boolean;

	/**
	 * Defines the preferred package manager.
	 */
	packageManager: "bun" | "npm" | "pnpm" | "yarn";
};

/**
 * Provides configuration information relating to a dependency.
 */
type DependencyConfig = {
	/**
	 * Defines the preferred dependency mode.
	 */
	mode: "dev" | "prod";

	/**
	 * Local path or npm version of the dependency to be used when {@link DependencyConfig.mode} is `dev`.
	 */
	version: string;
};

/**
 * Provides a utility type that recursively applies {@link Partial} to all properties that are objects.
 */
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
