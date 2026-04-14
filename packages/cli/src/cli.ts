import { program } from "commander";

import { config, create, link, list, pack, restart, setDeveloperMode, stop, unlink, validate } from "./commands";
import { packageManager } from "./package-manager";

program
	.command("create")
	.description("Stream Deck plugin creation wizard.")
	.action(() => create());

program
	.command("link")
	.argument("[path]", "Path of the plugin to link.")
	.description("Links the plugin to Stream Deck.")
	.action((path) => link({ path }));

program
	.command("unlink")
	.argument("<uuid>")
	.option("-d|--delete", "Enable deletion of non-linked plugins.")
	.description("Unlinks the plugin from Stream Deck.")
	.action((uuid, opts) => unlink({ uuid, ...opts }));

program
	.command("list")
	.option("-a|--all", "Show all plugins", false)
	.description("Display list of installed plugins.")
	.action((opts) => list(opts));

program
	.command("restart")
	.alias("r")
	.description("Starts the plugin in Stream Deck; if the plugin is already running, it is stopped first.")
	.argument("<uuid>")
	.action((uuid: string) => restart({ uuid }));

program
	.command("stop")
	.alias("s")
	.description("Stops the plugin in Stream Deck.")
	.argument("<uuid>")
	.action((uuid: string) => stop({ uuid }));

program
	.command("dev")
	.description("Enables developer mode.")
	.option("-d|--disable", "Disables developer mode", false)
	.action(({ disable }) => setDeveloperMode({ disable }));

program
	.command("validate")
	.description("Validates the Stream Deck plugin.")
	.argument("[path]", "Path of the plugin to validate")
	.option("--force-update-check", "Forces an update check", false)
	.option("--no-update-check", "Disables updating schemas", true)
	.action((path, opts) => validate({ ...opts, path }));

program
	.command("pack")
	.alias("bundle")
	.description("Creates a .streamDeckPlugin file from the plugin.")
	.argument("[path]", "Path of the plugin to pack")
	.option("--dry-run", "Generates a report without creating a package", false)
	.option("-f|--force", "Forces saving, overwriting an package if it exists", false)
	.option("-o|--output <output>", "Specifies the path for the output directory")
	.option("--version <version>", "Plugin version; value will be written to the manifest")
	.option("--force-update-check", "Forces an update check", false)
	.option("--no-update-check", "Disables updating schemas", true)
	.option("--ignore-validation", "Bypass validation errors (not recommended)", false)
	.action((path, opts) => pack({ ...opts, path }));

const configCommand = program.command("config").description("Manage the local configuration.");

configCommand
	.command("set")
	.description("Sets each of the configuration keys to their provided value.")
	.argument("<key>=<value>")
	.argument("[<key>=<value>...]")
	.action((entry: string, entries: string[]) => config.set({ entry, entries }));

configCommand
	.command("unset")
	.description("Resets each of the configuration keys to their default values.")
	.argument("<key>")
	.argument("[<key>...]")
	.action((key: string, keys: string[]) => config.unset({ key, keys: keys }));

configCommand
	.command("list")
	.description("Lists all configuration.")
	.action(() => config.list());

configCommand
	.command("reset")
	.description("Resets all configuration.")
	.action(() => config.reset());

program
	.version(packageManager.getVersion({ checkEnvironment: true }), "-v", "display CLI version")
	.option("-l, --list", "display list of installed plugins")
	.action((opts) => {
		if (opts.list) {
			list();
		} else {
			program.help();
		}
	})
	.parse();
