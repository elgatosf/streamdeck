import { existsSync } from "node:fs";

import { rule } from "../../rule";
import { type PluginContext } from "../plugin";

/**
 * Validates the JSON schema of the manifest; this validation fulfils the same role as if the JSON were validated in an IDE, i.e. custom keyword validation is not applied.
 */
export const manifestExistsAndSchemaIsValid = rule<PluginContext>(function (plugin: PluginContext) {
	// Do nothing if the specified path (of the plugin) does not exist.
	if (!existsSync(this.path)) {
		return;
	}

	// Check if the manifest exists.
	if (!existsSync(plugin.manifest.path)) {
		this.addError(plugin.manifest.path, "Manifest not found");
	}

	plugin.manifest.errors.forEach(({ message, location }) => {
		// When the directory name is a valid identifier, but the UUID is not specified in the manifest, show a suggestion.
		if (plugin.hasValidId && location?.instancePath === "" && message === "must contain property: UUID") {
			this.addError(plugin.manifest.path, message, {
				location,
				suggestion: `Expected: ${plugin.id}`,
			});

			return;
		}

		// Otherwise add the error.
		this.addError(plugin.manifest.path, message, { location });
	});
});
