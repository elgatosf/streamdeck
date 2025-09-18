import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { Manifest } from "../api";
import { Lazy } from "../common/lazy";
import { Version } from "./common/version";

const manifest = new Lazy<Manifest | null>(() => {
	const path = join(process.cwd(), "manifest.json");
	if (!existsSync(path)) {
		throw new Error("Failed to read manifest.json as the file does not exist.");
	}

	try {
		return JSON.parse(
			readFileSync(path, {
				encoding: "utf-8",
				flag: "r",
			}).toString(),
		);
	} catch (e) {
		if (e instanceof SyntaxError) {
			return null;
		} else {
			throw e;
		}
	}
});

const softwareMinimumVersion = new Lazy<Version | null>(() => {
	if (manifest.value === null) {
		return null;
	}

	return new Version(manifest.value.Software.MinimumVersion);
});

/**
 * Gets the SDK version that the plugin requires.
 * @returns SDK version; otherwise `null` when the plugin is DRM protected.
 */
export function getSDKVersion(): number | null {
	return manifest.value?.SDKVersion ?? null;
}

/**
 * Gets the minimum version that the plugin requires.
 * @returns Minimum required version; otherwise `null` when the plugin is DRM protected.
 */
export function getSoftwareMinimumVersion(): Version | null {
	return softwareMinimumVersion.value;
}

/**
 * Gets the manifest associated with the plugin.
 * @returns The manifest; otherwise `null` when the plugin is DRM protected.
 */
export function getManifest(): Manifest | null {
	return manifest.value;
}
