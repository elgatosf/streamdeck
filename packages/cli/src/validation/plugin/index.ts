import type { ValidationResult } from "../result";
import { validate } from "../validator";
import type { PluginValidationOptions } from "./options";
import { createContext, type PluginContext } from "./plugin";
import { layoutItemsAreWithinBoundsAndNoOverlap } from "./rules/layout-item-bounds";
import { layoutItemKeysAreUnique } from "./rules/layout-item-keys";
import { layoutsExistAndSchemasAreValid } from "./rules/layout-schema";
import { categoryMatchesName } from "./rules/manifest-category";
import { manifestFilesExist } from "./rules/manifest-files-exist";
import { manifestExistsAndSchemaIsValid } from "./rules/manifest-schema";
import { manifestUrlsExist } from "./rules/manifest-urls-exist";
import { manifestUuids } from "./rules/manifest-uuids";
import { pathIsDirectoryAndUuid } from "./rules/path-input";

/**
 * Validates a Stream Deck plugin.
 * @param opts The options used to validate the plugin.
 * @returns The validation result.
 */
export async function validatePlugin(opts: PluginValidationOptions): Promise<ValidationResult> {
	const ctx = createContext(opts);
	return validate<PluginContext>(opts.path, ctx, [
		pathIsDirectoryAndUuid,
		manifestExistsAndSchemaIsValid,
		manifestFilesExist,
		manifestUuids,
		manifestUrlsExist,
		categoryMatchesName,
		layoutsExistAndSchemasAreValid,
		layoutItemKeysAreUnique,
		layoutItemsAreWithinBoundsAndNoOverlap,
	]);
}
