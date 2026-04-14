import chalk from "chalk";
import { lstatSync, symlinkSync, unlinkSync } from "node:fs";
import { basename, resolve } from "node:path";

import { command } from "../common/command";
import { getPluginId, getPlugins, getPluginsPath } from "../stream-deck";

/**
 * Attempts to create a symbolic-link for the given path within the Stream Deck plugin's folder; this will effectively install the plugin to Stream Deck.
 */
export const link = command<LinkOptions>(
	(options, feedback) => {
		feedback.spin("Linking plugin");

		// Validate the path is a directory that exists.
		options.path = resolve(options.path);
		if (lstatSync(options.path, { throwIfNoEntry: false })?.isDirectory() !== true) {
			return feedback
				.error("Linking failed")
				.log(`Directory not found: ${basename(options.path)}`)
				.exit(1);
		}

		// Validate the directory name is the correct format.
		const uuid = getPluginId(options.path);
		if (uuid === undefined) {
			return feedback
				.error("Linking failed")
				.log(`Invalid directory name: ${basename(options.path)}`)
				.log(
					'Name must be in reverse DNS format, be suffixed with ".sdPlugin", and must only contain lowercase alphanumeric characters (a-z, 0-9), hyphens (-), and periods (.).',
				)
				.log(`Examples: ${chalk.green("com.elgato.wave-link.sdPlugin")}, ${chalk.green("tv.twitch.studio.sdPlugin")}`)
				.exit(1);
		}

		// Check if there is a conflict with an already installed plugin.
		const existing = getPlugins().find((p) => p.uuid === uuid);
		if (existing) {
			if (existing.targetPath !== null && resolve(existing.targetPath) === resolve(options.path)) {
				// Remove the existing link and re-link later to ensure a valid junction is established.
				unlinkSync(resolve(getPluginsPath(), basename(options.path)));
			} else {
				return feedback
					.error("Linking failed")
					.log(`Plugin already installed: ${uuid}`)
					.log(
						`Another plugin with this UUID is already installed. Please uninstall the plugin, or rename the directory being linked, and try again.`,
					)
					.exit(1);
			}
		}

		symlinkSync(resolve(options.path), resolve(getPluginsPath(), basename(options.path)), "junction");
		feedback.success("Linked successfully");
	},
	{
		path: process.cwd(),
	},
);

/**
 * Options available to {@link link}.
 */
type LinkOptions = {
	/**
	 * Path to the plugin.
	 */
	path?: string;
};
