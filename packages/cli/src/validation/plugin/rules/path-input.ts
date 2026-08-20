import { existsSync, lstatSync } from "node:fs";
import { basename } from "node:path";

import { colorize } from "../../../common/stdout";
import { isValidPluginId } from "../../../stream-deck";
import { rule } from "../../rule";
import { directorySuffix, type PluginContext } from "../plugin";

export const pathIsDirectoryAndUuid = rule<PluginContext>(function (plugin: PluginContext) {
	const name = basename(this.path);

	// Path exists.
	if (!existsSync(this.path)) {
		this.addError(this.path, "Directory not found");
		return;
	}

	// Path is a directory.
	if (!lstatSync(this.path).isDirectory()) {
		this.addError(this.path, "Path must be a directory");
		return;
	}

	// Directory name suffix.
	if (!name.endsWith(directorySuffix)) {
		this.addError(this.path, `Name must be suffixed with ${colorize(".sdPlugin")}`);
	}

	// Directory name is a valid identifier.
	if (!isValidPluginId(plugin.id)) {
		this.addError(
			this.path,
			"Name must be in reverse DNS format, and must only contain lowercase alphanumeric characters (a-z, 0-9), hyphens (-), and periods (.)",
			{
				suggestion: "Example: com.elgato.wave-link",
			},
		);
	}
});
