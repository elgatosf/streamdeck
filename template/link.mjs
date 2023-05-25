import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const PLUGIN_NAME = "com.elgato.nodejs.sdPlugin";

/**
 * NB. This is a temporary script until we incorporate a CLI for linking.
 */

const pluginsDir = getElgatoPluginsDir();

if (fs.existsSync(pluginsDir)) {
	if (await confirmLinking()) {
		fs.rmdirSync(pluginsDir);
	} else {
		console.log("Aborting");
		process.exit(0);
	}
}

fs.symlinkSync(getBuildDir(), pluginsDir, "junction");
console.log("Successfully linked development workspace to Stream Deck plugins directory");

/**
 * Gets the path to the directory where Stream Deck plugins are located.
 * @returns The path.
 */
function getElgatoPluginsDir() {
	if (os.platform === "darwin") {
		return path.join(os.homedir(), "Library/Application Support/com.elgato.StreamDeck/Plugins", PLUGIN_NAME);
	} else {
		const appData = process.env.APPDATA ?? path.join(os.homedir(), "AppData/Roaming");
		return path.join(appData, "Elgato/StreamDeck/Plugins", PLUGIN_NAME);
	}
}

/**
 * Gets the path to this template's build output.
 * @returns The path.
 */
function getBuildDir() {
	const workspaceDir = path.dirname(fileURLToPath(import.meta.url));
	return path.join(workspaceDir, "plugin");
}

/**
 * Prompts the user to confirm that linking will replace a directory that already exists in the Stream Deck plugins folder.
 */
async function confirmLinking() {
	const rl = readline.createInterface({ input, output });
	try {
		console.log(`The plugin "${path.basename(pluginsDir)}" already exists.`);
		const answer = await rl.question(`Would you like to replace it? (Y/N): `);

		return answer?.toLowerCase() === "y";
	} finally {
		rl.close();
	}
}
