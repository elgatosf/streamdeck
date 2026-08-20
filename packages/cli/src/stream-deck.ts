import find from "find-process";
import { Dirent, readdirSync, readlinkSync } from "node:fs";
import os from "node:os";
import { basename, join, resolve } from "node:path";

const PLUGIN_SUFFIX = ".sdPlugin";

/**
 * Gets the list of installed plugins.
 * @returns List of plugins, including their path and UUID.
 */
export function getPlugins(): PluginInfo[] {
	const pluginsPath = getPluginsPath();
	return readdirSync(pluginsPath, { withFileTypes: true }).reduce<PluginInfo[]>((plugins, entry) => {
		if (entry.isDirectory() || entry.isSymbolicLink()) {
			const uuid = getPluginId(entry.name);
			if (uuid) {
				plugins.push(new PluginInfo(join(pluginsPath, entry.name), entry, uuid));
			}
		}

		return plugins;
	}, []);
}

/**
 * Gets the installation path of the plugins that Stream Deck will run.
 * @returns The path.
 */
export function getPluginsPath(): string {
	if (os.platform() === "darwin") {
		return join(os.homedir(), "Library/Application Support/com.elgato.StreamDeck/Plugins");
	}

	const appData = process.env.APPDATA ?? join(os.homedir(), "AppData/Roaming");
	return resolve(join(appData, "Elgato/StreamDeck/Plugins"));
}

/**
 * Determines whether the specified {@link value} is structured like a pre-defined layout.
 * @param value Value to check.
 * @returns `true` when the string likely represents a pre-defined layout; otherwise `false`.
 */
export function isPredefinedLayoutLike(value: string): boolean {
	return value.startsWith("$") === true && !value.endsWith(".json");
}

/**
 * Determines whether a plugin is installed that matches the specified {@link uuid}.
 * @param uuid Unique-identifier of the plugin to look for.
 * @returns `true` when a plugin was found that matches the {@link uuid}; otherwise `false`.
 */
export function isPluginInstalled(uuid: string): boolean {
	return getPlugins().some((pi) => pi.uuid === uuid);
}

/**
 * Determines if the Stream Deck application is currently running.
 * @returns `true` when the application is running; otherwise `false`.
 */
export async function isStreamDeckRunning(): Promise<boolean> {
	const name = os.platform() === "darwin" ? "Elgato Stream Deck" : "StreamDeck.exe";
	const processes = await find("name", name);

	return processes.length > 0;
}

/**
 * Attempts to parse the {@link path} to determine the plugin's UUID.
 * @param path Path that represents a plugin; this should end with `.sdPlugin`.
 * @returns The plugin's UUID; otherwise `undefined`.
 */
export function getPluginId(path: string): string | undefined {
	const name = basename(path);
	return name.endsWith(PLUGIN_SUFFIX) ? name.slice(0, -9) : undefined;
}

/**
 * Generates a UUID from the `author` and `name` values. Values are parsed to ensure valid sections, resulting in a complete UUID; when a value cannot be parsed, the resulting UUID is `undefined`.
 * @param author Author of the plugin.
 * @param name Name of the plugin.
 * @returns UUID that represents the plugin, from information found in the manifest.json file; otherwise `undefined`.
 */
export function generatePluginId(author: string | undefined, name: string | undefined): string | undefined {
	const sections = {
		author: getSafeValue(author),
		name: getSafeValue(name),
	};

	if (sections.author === undefined || sections.name === undefined) {
		return;
	}

	return `com.${sections.author}.${sections.name}`;
}

/**
 * Attempts to format the specified `value` to ensure it is safe for a plugin's identifier. When the `value` results in an empty string, `undefined` is returned.
 * @param value Value to parse, and make UUID safe.
 * @returns Value that is safe for a UUID section; otherwise `undefined`.
 */
export function getSafeValue(value: string | undefined): string | undefined {
	if (value === undefined) {
		return undefined;
	}

	const safeValue = value
		.toLowerCase()
		.replaceAll(" ", "-")
		.replaceAll("_", "-")
		.replaceAll(/[^a-z0-9-]/g, "");

	return safeValue !== "" ? safeValue : undefined;
}

/**
 * Determines whether the specified `uuid` is a valid plugin unique-identifier.
 * @param uuid UUID being checked.
 * @returns `true` when the `uuid` represents a valid unique-identifier; otherwise `false`.
 */
export function isValidPluginId(uuid: string | undefined): boolean {
	if (uuid === undefined || uuid === null) {
		return false;
	}

	return /^([a-z0-9-]+)(\.[a-z0-9-]+)+$/.test(uuid);
}

/**
 * Represents an error thrown when resolving a path, as determined by Stream Deck.
 */
export class PathError extends Error {
	/**
	 * Initializes a new instance of the {@link PathError} class.
	 * @param message Error message
	 */
	constructor(message: string) {
		super(message);
	}
}

/**
 * Provides information about an installed plugin.
 */
class PluginInfo {
	/**
	 * Private backing field for {@link PluginInfo.targetPath}.
	 */
	private _targetPath: string | null | undefined = undefined;

	/**
	 * Initializes a new instance of the {@link PluginInfo} class.
	 * @param path Path where the plugin is installed.
	 * @param entry The directory entry of the plugin.
	 * @param uuid Unique identifier of the plugin.
	 */
	constructor(
		public readonly path: string,
		private readonly entry: Dirent,
		public readonly uuid: string,
	) {}

	/**
	 * Gets a value indicating whether the plugin is a linked (dev) plugin.
	 * @returns `true` when the plugin is linked; otherwise `false`.
	 */
	public get isLink(): boolean {
		return this.targetPath !== null;
	}

	/**
	 * When the installed plugin is a symbolic link, the target path is the location of the file on disk.
	 * @returns The target path; otherwise `null`.
	 */
	public get targetPath(): string | null {
		if (this._targetPath === undefined) {
			this._targetPath = this.entry.isSymbolicLink() ? readlinkSync(this.path) : null;
		}

		return this._targetPath;
	}
}

export { type PluginInfo };
