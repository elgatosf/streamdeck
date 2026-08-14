import childProcess from "node:child_process";
import os from "node:os";
import { Registry } from "rage-edit";

import { command } from "../common/command";

/**
 * Sets developer mode, enabling / disabling the local development of Stream Deck plugins.
 */
export const setDeveloperMode = command<DeveloperModeOptions>(
	async (options, output) => {
		output.spin(`${options.disable ? "Disabling" : "Enabling"} developer mode`);

		const flagName = "developer_mode";
		if (os.platform() === "darwin") {
			childProcess.spawnSync("defaults", [
				"write",
				"com.elgato.StreamDeck",
				flagName,
				"-bool",
				options.disable ? "NO" : "YES",
			]);
		} else {
			Registry.set("HKEY_CURRENT_USER\\Software\\Elgato Systems GmbH\\StreamDeck", flagName, options.disable ? 0 : 1);
		}

		output.success(`Developer mode ${options.disable ? "disabled" : "enabled"}`);
	},
	{
		disable: false,
	},
);

/**
 * Options available to {@link setDeveloperMode}.
 */
type DeveloperModeOptions = {
	/**
	 * Determines whether to disable developer mode; default `false`.
	 */
	disable?: boolean;
};
