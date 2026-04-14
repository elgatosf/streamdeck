import { rule } from "../../rule";
import { type PluginContext } from "../plugin";

/**
 * Validates the "Category" matches the "Name" of the plugin, as defined within the manifest.
 */
export const categoryMatchesName = rule<PluginContext>(function (plugin) {
	const {
		manifest: {
			value: { Category: category, Name: name },
		},
	} = plugin;

	if (name?.value !== undefined && category?.value !== name?.value) {
		const val = category?.value === undefined ? undefined : `'${category}'`;
		this.addWarning(plugin.manifest.path, `should match plugin name`, {
			location: {
				key: "Category",
			},
			...category,
			suggestion: `Expected '${name}', but was ${val}`,
		});
	}
});
