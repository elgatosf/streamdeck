import chalk from "chalk";

import { command } from "../common/command";
import { runUrl } from "../common/runner";
import { isPluginInstalled, isStreamDeckRunning } from "../stream-deck";

/**
 * Restarts the first plugin that matches the given {@link RestartOptions.uuid}.
 */
export const restart = command<RestartOptions>(
	async ({ uuid, noStart }, output) => {
		output.spin(`Restarting ${uuid}`);

		// Check we have a plugin installed that matches the uuid.
		if (!isPluginInstalled(uuid)) {
			return output.error("Restarting failed").log(`Plugin not found: ${uuid}`).exit(1);
		}

		// When Stream Deck isn't running, start it.
		if (!(await isStreamDeckRunning())) {
			if (noStart) {
				return;
			}

			await runUrl(`streamdeck://plugins/restart/${uuid}`);
			return output.info("Stream Deck is not running. Starting Stream Deck.").exit();
		}

		// Restart the plugin.
		await runUrl(`streamdeck://plugins/restart/${uuid}`);
		output.success(`Restarted ${chalk.green(uuid)}`);
	},
	{
		noStart: false,
	},
);

/**
 * Options available to {@link restart}.
 */
type RestartOptions = {
	/**
	 * Identifies the plugin.
	 */
	uuid: string;

	/**
	 * Determines whether Stream Deck should start if it is not already running.
	 */
	noStart?: boolean;
};
