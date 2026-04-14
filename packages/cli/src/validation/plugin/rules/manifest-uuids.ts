import { colorize } from "../../../common/stdout";
import { rule } from "../../rule";
import { type PluginContext } from "../plugin";

/**
 * Validates the unique identifiers within the manifest, ensuring the `UUID` matches the parent directory, and the actions' `UUID` are unique and are prefixed with the plugin's `UUID`.
 */
export const manifestUuids = rule<PluginContext>(async function (plugin: PluginContext) {
	const { value: manifest } = plugin.manifest;

	// When the directory name is a valid identifier, check it matches the identifier in the manifest.
	if (plugin.hasValidId && manifest.UUID?.value !== undefined && plugin.id !== manifest.UUID.value) {
		this.addError(plugin.manifest.path, "must match parent directory name", {
			location: manifest.UUID.location,
			suggestion: `Expected: ${plugin.id}`,
		});
	}

	// Check all of the action identifiers.
	const uuids = new Set<string>();
	manifest.Actions?.forEach(({ UUID: uuid }) => {
		if (uuid?.value === undefined) {
			return;
		}

		// Validate the action identifier is unique.
		if (uuids.has(uuid.value)) {
			this.addError(plugin.manifest.path, "must be unique", uuid);
		} else {
			uuids.add(uuid.value);
		}

		// Check if the action identifier is prefixed with the plugin identifier.
		if (plugin.hasValidId && !uuid.value.startsWith(plugin.id)) {
			this.addWarning(plugin.manifest.path, `should be prefixed with ${colorize(plugin.id)}`, uuid);
		}
	});
});
