import { rule } from "../../rule";
import { type PluginContext } from "../plugin";

/**
 * Validate the item keys within a layout are unique.
 */
export const layoutItemKeysAreUnique = rule<PluginContext>(function (plugin: PluginContext) {
	plugin.manifest.layoutFiles.forEach(({ layout }) => {
		// Create a set of strings to keep track of keys.
		const keys = new Set<string>();
		layout.value.items?.forEach(({ key }) => {
			if (key?.value === undefined) {
				return;
			}

			// Validate the item key is unique.
			if (keys.has(key.value)) {
				this.addError(layout.path, "must be unique", key);
			} else {
				keys.add(key.value);
			}
		});
	});
});
