import chalk from "chalk";
import inquirer from "inquirer";
import fs from "node:fs";
import path from "node:path";

import { command } from "../common/command";
import { createCopier } from "../common/file-copier";
import { run } from "../common/runner";
import { StdOut } from "../common/stdout";
import { getConfig } from "../config";
import { generatePluginId, getPlugins, isValidPluginId } from "../stream-deck";
import { invalidCharacters, isExecutable, isSafeBaseName, relative } from "../system/path";
import { setDeveloperMode } from "./dev";
import { link } from "./link";
import { restart } from "./restart";

const TEMPLATE_PLUGIN_UUID = "com.elgato.template";

/**
 * Guides the user through a creation wizard, scaffolding a Stream Deck plugin.
 */
export const create = command(async (options, stdout) => {
	// Show the welcome, and gather all of the required input from the user.
	showWelcome(stdout);
	const pluginInfo = await promptForPluginInfo();
	const destination = await validateDestination(pluginInfo.uuid.split(".")[2] || "", stdout);

	// Prompt the user to confirm the information.
	if (!(await isPluginInfoCorrect(stdout))) {
		return stdout.info("Aborted").exit();
	}

	// Run final pre-checks.
	validateFinalPreChecks(pluginInfo, destination, stdout);

	// Begin.
	stdout.log();
	stdout.log(`Creating ${chalk.blue(pluginInfo.name)}...`);

	// Enable developer mode, and generate the plugin from the template.
	await stdout.spin("Enabling developer mode", () => setDeveloperMode({ quiet: true }));
	await stdout.spin("Generating plugin", () => renderTemplate(destination, pluginInfo));

	// Install node dependencies, build the plugin, and finalize the setup.
	const { packageManager: npm } = getConfig();
	await stdout.spin("Installing dependencies", () => run(`${npm} install`, { cwd: destination }));
	await stdout.spin("Building plugin", () => run(`${npm} run build`, { cwd: destination }));
	await stdout.spin("Finalizing setup", () => finalize(destination, pluginInfo));

	stdout.log().log(chalk.green("Successfully created plugin!"));
	await tryOpenVSCode(destination, stdout);
});

/**
 * Shows the welcome message.
 * @param stdout The stream where messages, and termination results, will be output.
 */
function showWelcome(stdout: StdOut): void {
	stdout
		.log(" ___ _                        ___         _   ")
		.log("/ __| |_ _ _ ___ __ _ _ __   |   \\ ___ __| |__")
		.log("\\__ \\  _| '_/ -_) _` | '  \\  | |) / -_) _| / /")
		.log("|___/\\__|_| \\___\\__,_|_|_|_| |___/\\___\\__|_\\_\\")
		.log()
		.log(`Welcome to the ${chalk.green("Stream Deck Plugin")} creation wizard.`)
		.log()
		.log("This utility will guide you through creating a local development environment for a plugin.")
		.log(`For more information on building plugins see ${chalk.blue("https://docs.elgato.com")}.`)
		.log()
		.log(chalk.grey("Press ^C at any time to quit."))
		.log();
}

/**
 * Prompts the user for the plugin information.
 * @returns User input that provides required information to build a plugin.
 */
async function promptForPluginInfo(): Promise<PluginInfo> {
	return await inquirer.prompt<PluginInfo>([
		{
			name: "author",
			message: "Author:",
			validate: required("Please enter the author."),
			type: "input",
		},
		{
			name: "name",
			message: "Plugin Name:",
			validate: required("Please enter the name of the plugin."),
			type: "input",
		},
		{
			name: "uuid",
			message: "Plugin UUID:",
			default: ({ author, name }: Partial<PluginInfo>): string | undefined => generatePluginId(author, name),
			validate: (uuid: string): boolean | string => {
				if (!isValidPluginId(uuid)) {
					return "UUID must be in reverse DNS format, and must only contain lowercase alphanumeric characters (a-z, 0-9), hyphens (-), and periods (.).";
				}

				if (getPlugins().some((p) => p.uuid === uuid)) {
					return "Another plugin with this UUID is already installed.";
				}

				return true;
			},
			type: "input",
		},
		{
			name: "description",
			message: "Description:",
			validate: required("Please enter a brief description of what the plugin will do."),
			type: "input",
		},
	]);
}

/**
 * Validates the destination where the plugin will be generated.
 * @param dirName The default name of the directory.
 * @param stdout The stream where messages, and termination results, will be output.
 * @returns The destination, as a full path.
 */
async function validateDestination(dirName: string, stdout: StdOut): Promise<string> {
	// Validate the default directory name; when invalid, prompt for another.
	const validation = validate(dirName);
	if (validation !== true) {
		stdout.log();
		stdout.log(validation);
		const { directory } = await inquirer.prompt({
			name: "directory",
			message: "Directory:",
			validate,
			type: "input",
		});

		dirName = directory;
	}

	return path.join(process.cwd(), dirName);

	/**
	 * Validates the specified {@link value} is a valid directory name, and the directory does not exist.
	 * @param value Value to validate.
	 * @returns `true` when the directory name is valid, and the directory does not exist; otherwise a `string` representing the error.
	 */
	function validate(value: string | undefined): boolean | string {
		if (value === undefined || value.trim() === "") {
			return "Please specify a directory name.";
		} else if (!isSafeBaseName(value)) {
			return `Directory name cannot contain ${invalidCharacters.join(" ")} and must not begin with a period (.).`;
		} else if (fs.existsSync(path.join(process.cwd(), value))) {
			return `Directory ${chalk.yellow(value)} already exists. Please specify a different directory name.`;
		}

		return true;
	}
}

/**
 * Validates the final pre-checks prior to a plugin being scaffolded.
 * @param param0 The plugin information.
 * @param param0.uuid Unique identifier that identifies the plugin.
 * @param destination Destination where the plugin will be scaffolded.
 * @param stdout The stream where messages, and termination results, will be output.
 * @returns Returns when the pre-checks pass validation.
 */
function validateFinalPreChecks({ uuid }: PluginInfo, destination: string, stdout: StdOut): never | void {
	if (getPlugins().some((p) => p.uuid === uuid)) {
		return stdout.error(`Another plugin with the UUID ${chalk.yellow(uuid)} is already installed.`).exit(1);
	}

	if (fs.existsSync(destination)) {
		return stdout.error(`Directory ${chalk.yellow(destination)} already exists.`).exit(1);
	}
}

/**
 * Prompts the user to confirm they're happy with the input information.
 * @param stdout The stream where messages, and termination results, will be output.
 * @returns `true` when the user is happy with the information; otherwise `false`.
 */
async function isPluginInfoCorrect(stdout: StdOut): Promise<boolean> {
	stdout.log();
	return (
		await inquirer.prompt({
			name: "confirm",
			message: "Create Stream Deck plugin from information above?",
			default: true,
			type: "confirm",
		})
	).confirm;
}

/**
 * Creates a template renderer capable of copying template files to a destination, and rendering them with supporting data.
 * @param destination Destination where the plugin is being created.
 * @param pluginInfo Information about the plugin.
 * @param options Supporting data supplied to the renderer.
 * @returns The file copier capable of rendering the template.
 */
function createTemplateRenderer(
	destination: string,
	pluginInfo: PluginInfo,
	options = { isPreBuild: true },
): ReturnType<typeof createCopier> {
	const config = getConfig();
	return createCopier({
		dest: destination,
		source: relative("../template"),
		data: {
			...pluginInfo,
			...options,
			npm: {
				cli: config.npm.cli.version,
				streamDeck: config.npm.streamDeck.version,
			},
		},
	});
}

/**
 * Renders the template, copying the output to the destination directory.
 * @param destination Destination where the plugin is being created.
 * @param pluginInfo Information about the plugin.
 */
async function renderTemplate(destination: string, pluginInfo: PluginInfo): Promise<void> {
	const template = createTemplateRenderer(destination, pluginInfo);
	await Promise.allSettled([
		template.copy(".vscode"),
		template.copy(`${TEMPLATE_PLUGIN_UUID}.sdPlugin/imgs`, `${pluginInfo.uuid}.sdPlugin/imgs`),
		template.copy(`${TEMPLATE_PLUGIN_UUID}.sdPlugin/ui`, `${pluginInfo.uuid}.sdPlugin/ui`),
		template.copy(`${TEMPLATE_PLUGIN_UUID}.sdPlugin/manifest.json.ejs`, `${pluginInfo.uuid}.sdPlugin/manifest.json`),
		template.copy("src"),
		template.copy("_.gitignore", ".gitignore"),
		template.copy("package.json.ejs"),
		template.copy("rollup.config.mjs.ejs"),
		template.copy("tsconfig.json.ejs"),
	]);
}

/**
 * Finalizes the creation of the plugin.
 * @param destination Destination where the plugin is being created.
 * @param pluginInfo Information about the plugin.
 */
async function finalize(destination: string, pluginInfo: PluginInfo): Promise<void> {
	createTemplateRenderer(destination, pluginInfo, { isPreBuild: false }).copy("rollup.config.mjs.ejs");

	await link({
		path: path.join(destination, `${pluginInfo.uuid}.sdPlugin`),
		quiet: true,
	});

	await restart({
		uuid: pluginInfo.uuid,
		noStart: true,
		quiet: true,
	});
}

/**
 * Determines if the user has VS Code installed, and if so, prompts them to open the plugin.
 * @param destination Destination where the plugin is being created.
 * @param stdout The stream where messages, and termination results, will be output.
 */
async function tryOpenVSCode(destination: string, stdout: StdOut): Promise<void> {
	if (!isExecutable("code")) {
		return;
	}

	stdout.log();
	const vsCode = await inquirer.prompt({
		name: "confirm",
		message: "Would you like to open the plugin in VS Code?",
		default: true,
		type: "confirm",
	});

	if (vsCode.confirm) {
		run("code ./ --goto src/plugin.ts", { cwd: destination });
	}
}

/**
 * Gets a function that accepts a single value; when that value is null, empty, or whitespace, the {@link error} is returned.
 * @param error Error message to display when a value was not specified.
 * @returns Function that can be used to validate an question's answer.
 */
function required(error: string) {
	return (value: unknown): boolean | string => {
		if (value && value?.toString().replaceAll(" ", "") != "") {
			return true;
		}

		return error;
	};
}

/**
 * Provides information about the plugin.
 */
type PluginInfo = {
	/**
	 * Author of the plugin; this can be a user, or an organization.
	 */
	author: string;

	/**
	 * General description of what the plugin does.
	 */
	description: string;

	/**
	 * Name of the plugin; this is displayed to user's in the Marketplace, and is used to easily identify the plugin.
	 */
	name: string;

	/**
	 * Plugin's unique identifier.
	 */
	uuid: string;
};
