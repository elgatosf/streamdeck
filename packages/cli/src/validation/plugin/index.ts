import type { ValidationResult } from "../result";
import { validate } from "../validator";
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
 * Validates the Stream Deck plugin as the specified {@link path}.
 * @param path Path to the plugin.
 * @returns The validation result.
 */
export async function validatePlugin(path: string): Promise<ValidationResult> {
	const ctx = await createContext(path);
	return validate<PluginContext>(path, ctx, [
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
