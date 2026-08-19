import { DefinedError } from "ajv";
import { existsSync } from "node:fs";

import { rule } from "../../rule";
import { type PluginContext } from "../plugin";

/**
 * Validate the layout files referenced in the manifest exist, and log any JSON schema errors that were encountered when validating their content.
 */
export const layoutsExistAndSchemasAreValid = rule<PluginContext>(function (plugin: PluginContext) {
	// Validate the layout files exist.
	plugin.manifest.layoutFiles.forEach(({ layout, location }) => {
		if (!existsSync(layout.path)) {
			this.addError(plugin.manifest.path, "layout not found", { location });
		}
	});

	// Add their JSON schema errors.
	plugin.manifest.layoutFiles.forEach(({ layout: layout }) => {
		layout.errors.forEach(({ message, location, source }) => {
			this.addError(layout.path, transformMessage(message, source), { location });
		});
	});
});

/**
 * Transforms the {@link message} to provide more insightful error messages.
 * @param message Original message.
 * @param source Source of the error.
 * @returns Transform message; otherwise the original {@link message}.
 */
function transformMessage(message: string, source: DefinedError): string {
	// We only transform min and max errors.
	if (source.keyword !== "minimum" && source.keyword !== "maximum") {
		return message;
	}

	// ... when they're for the rect property.
	const match = source.instancePath.match(/\/items\/\d+\/rect\/([0-3])$/);
	if (match === null) {
		return message;
	}

	const [, index] = match;
	return `${["x", "y", "width", "height"][index as unknown as number]} ${message}`;
}
