import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { Manifest } from "../api/manifest";
import { Version } from "./common/version";

let manifest: Omit<Manifest, "$schema">;
let softwareMinimumVersion: Version;

/**
 * Gets the minimum version that this plugin required, as defined within the manifest.
 * @returns Minimum required version.
 */
export function getSoftwareMinimumVersion(): Version {
	return (softwareMinimumVersion ??= new Version(getManifest().Software.MinimumVersion));
}

/**
 * Gets the manifest associated with the plugin.
 * @returns The manifest.
 */
export function getManifest(): Omit<Manifest, "$schema"> {
	return (manifest ??= readManifest());
}

/**
 * Reads the manifest associated with the plugin from the `manifest.json` file.
 * @returns The manifest.
 */
function readManifest(): Omit<Manifest, "$schema"> {
	const path = join(process.cwd(), "manifest.json");
	if (!existsSync(path)) {
		throw new Error("Failed to read manifest.json as the file does not exist.");
	}

	return JSON.parse(
		readFileSync(path, {
			encoding: "utf-8",
			flag: "r"
		}).toString()
	);
}
