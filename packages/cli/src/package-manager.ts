import { existsSync } from "node:fs";

import { version } from "../package.json";
import { relative } from "./system/path";

/**
 * Light-weight package manager for interacting with packages.
 */
class PackageManager {
	/**
	 * Gets the current version of the CLI from the package JSON file.
	 * @param opts Version format options.
	 * @returns The version, for example `0.3.0`.
	 */
	public getVersion(opts: GetVersionOptions = {}): string {
		if (opts.checkEnvironment && existsSync(relative("../src"))) {
			return `${version} (dev)`;
		}

		return version;
	}
}

/**
 * Package manager capable of updating the packages, in the scope of this package.
 */
export const packageManager = new PackageManager();

/**
 * Options for {@link PackageManager.getVersion}.
 */
type GetVersionOptions = {
	/**
	 * Determines whether to check the if the CLI is in development mode; when `true` the version will include a suffix of `(dev)`.
	 */
	checkEnvironment?: boolean;
};
