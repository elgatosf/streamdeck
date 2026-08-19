import chalk from "chalk";
import { existsSync } from "node:fs";

import { command } from "../common/command";
import { getPlugins } from "../stream-deck";

/**
 * Prints a list of installed plugins
 */
export const list = command<Options>(
	async (options, output) => {
		const plugins = getPlugins();
		for (const plugin of plugins) {
			if (!plugin.isLink && !options.all) {
				continue;
			}

			const { uuid, targetPath } = plugin;

			if (targetPath) {
				if (existsSync(targetPath)) {
					output.log(`${uuid} ${chalk.dim("→")} ${chalk.green(targetPath)}`);
				} else {
					output.log(`${uuid} ${chalk.dim("→")} ${chalk.red(targetPath)} ${chalk.dim("(not found)")}`);
				}
			} else {
				output.log(uuid);
			}
		}
	},
	{
		all: false,
	},
);

/**
 * Options for the {@link list} command.
 */
type Options = {
	/**
	 * Determines whether to show all plugins; when `false` only linked plugins are shown. Default is `false`.
	 */
	all?: boolean;
};
