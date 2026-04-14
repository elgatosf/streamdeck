import { createHash } from "node:crypto";
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import semver from "semver";
import { extract } from "tar";

import { dependencies, version } from "../package.json";
import { moveSync } from "./system/fs";
import { relative } from "./system/path";

/**
 * Light-weight package manager that wraps npm, capable of updating locally-scoped installed packages.
 */
class PackageManager {
	/**
	 * Checks for an update of the specified package.
	 * @param name Name of the package.
	 * @returns The update information; otherwise undefined.
	 */
	public async checkUpdate(name: string): Promise<PackageMetadataVersion | undefined> {
		// Check if the dependency is listed within the CLI's package.json.
		const range = name in dependencies ? dependencies[name as keyof typeof dependencies] : undefined;
		if (range === undefined) {
			throw new Error(`Package is not a dependency, ${name}`);
		}

		// Get the locally installed package, and registry entries.
		const installed = this.list(name);
		const registry = await this.search(name);

		// Get the latest version.
		const latestVersion = this.getLatestVersion(registry, range);
		if (latestVersion === undefined) {
			return;
		}

		// When there isn't an installed local version, or the latest version is greater, return the latest version.
		if (installed === undefined || semver.gt(latestVersion.version, installed.version)) {
			return latestVersion;
		}
	}

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

	/**
	 * Installs the specified package.
	 * @param pkg Package to install.
	 */
	public async install(pkg: PackageMetadataVersion): Promise<void> {
		// Download the package's tarball file to a temporary location.
		const file = relative(`../.tmp/${crypto.randomUUID()}.tar.gz`);
		mkdirSync(dirname(file), { recursive: true });

		try {
			await this.download(pkg, file);

			// Determine the package paths.
			const installationPath = relative(`../node_modules/${pkg.name}`);
			const tempPath = relative(`../.tmp/${pkg.name}/`);

			// Ensure we have a node_modules folder local to the package.
			if (!existsSync(installationPath)) {
				mkdirSync(installationPath, { recursive: true });
			}

			try {
				// Move the current installed package, and unpack the new package to node_modules.
				moveSync(installationPath, tempPath, { overwrite: true });
				mkdirSync(installationPath, { recursive: true });
				await extract({
					file,
					strip: 1,
					cwd: installationPath,
				});
			} catch (err) {
				// When something goes wrong, fallback to the previous package.
				moveSync(tempPath, installationPath, { overwrite: true });
				throw err;
			} finally {
				// Cleanup the temporary cache.
				if (existsSync(tempPath)) {
					rmSync(tempPath, { recursive: true });
				}
			}
		} finally {
			rmSync(file);
		}
	}

	/**
	 * Lists the installed local package.
	 * @param name Name of the package to list.
	 * @returns The package; otherwise undefined.
	 */
	public list(name: string): Omit<PackageMetadataVersion, "dist"> | undefined {
		const pkgPath = relative(`../node_modules/${name}`);
		if (!existsSync(pkgPath)) {
			return undefined;
		}

		const pkgJsonPath = join(pkgPath, "package.json");
		if (!existsSync(pkgJsonPath)) {
			return undefined;
		}

		return JSON.parse(readFileSync(pkgJsonPath, { encoding: "utf-8" }));
	}

	/**
	 * Searches the npm registry for specified package.
	 * @param name Package to search for.
	 * @returns The package; otherwise undefined.
	 */
	public async search(name: string): Promise<PackageMetadata> {
		const res = await fetch(`https://registry.npmjs.org/${name}`, {
			headers: {
				Accept: "application/vnd.npm.install-v1+json",
			},
		});

		if (res.status !== 200) {
			throw new Error(`Failed to read package from npm registry with status code ${res.status}`);
		}

		return (await res.json()) as PackageMetadata;
	}

	/**
	 * Downloads the contents of the specified {@link pkg} to the {@link dest} file.
	 * @param pkg Package to download.
	 * @param dest File where the packed (i.e. the tarball file) packaged will be downloaded to.
	 */
	private async download(pkg: PackageMetadataVersion, dest: string): Promise<void> {
		if (existsSync(dest)) {
			throw new Error(`File path already exists: ${dest}`);
		}

		const res = await fetch(pkg.dist.tarball);
		if (res.body === null) {
			throw new Error(`Failed to download package ${pkg.name} from ${pkg.dist.tarball}`);
		}

		// Create a hash to validate the download.
		const fileStream = createWriteStream(dest, { encoding: "utf-8" });
		const body = Readable.fromWeb(res.body);
		const hash = createHash("sha1");

		return new Promise((resolve, reject) => {
			fileStream.on("open", () => {
				// Read the contents of the body into both the file stream, and the hash in parallel.
				body
					.on("data", (data) => {
						hash.update(data);
						fileStream.write(data);
					})
					.on("error", reject)
					.on("close", () => {
						fileStream.close(() => {
							// Validate the shasum.
							const shasum = hash.digest("hex");
							if (shasum !== pkg.dist.shasum) {
								rmSync(dest);
								reject(`Failed to download package ${pkg.name} from ${pkg.dist.tarball}: shasum mismatch`);
							}

							resolve();
						});
					});
			});
		});
	}

	/**
	 * Gets the latest version, from the package metadata, that satisfies the {@link range}.
	 * @param pkg Package metadata whose versions should be checked.
	 * @param range Range of acceptable versions.
	 * @returns Latest version; otherwise undefined.
	 */
	private getLatestVersion(pkg: PackageMetadata, range: string): PackageMetadataVersion | undefined {
		return Object.keys(pkg.versions).reduce(
			(update, version) => {
				if (semver.satisfies(version, range) && (update === undefined || semver.gt(version, update.version))) {
					update = pkg.versions[version];
				}

				return update;
			},
			undefined as PackageMetadataVersion | undefined,
		);
	}
}

/**
 * Package manager capable of updating the packages, in the scope of this package.
 */
export const packageManager = new PackageManager();

/**
 * Provides information about a package, as listed in the npm registry.
 */
export type PackageMetadata = {
	/**
	 * Name of the version.
	 */
	name: string;

	/**
	 * Date the package was last modified.
	 */
	modified: Date;

	/**
	 * Versions of the package.
	 */
	versions: Record<string, PackageMetadataVersion>;
};

/**
 * Provides information about a package version, as listed in the npm registry.
 */
export type PackageMetadataVersion = {
	/**
	 * Name of the version.
	 */
	name: string;

	/**
	 * Version.
	 */
	version: string;

	/**
	 * Information relating to the package's pack file that contains the contents of the package.
	 */
	dist: {
		/**
		 * Shasum of the tarball file.
		 */
		shasum: string;

		/**
		 * URL to the tarball file that contains the contents of the package.
		 */
		tarball: string;
	};
};

/**
 * Options for {@link PackageManager.getVersion}.
 */
type GetVersionOptions = {
	/**
	 * Determines whether to check the if the CLI is in development mode; when `true` the version will include a suffix of `(dev)`.
	 */
	checkEnvironment?: boolean;
};
