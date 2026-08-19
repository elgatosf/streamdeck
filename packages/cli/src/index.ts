import chalk from "chalk";

import { validatePlugin } from "./validation/plugin";
import { getJsonSchemas } from "./validation/plugin/schemas";
import type { ValidationResult } from "./validation/result";

export {
	ValidationLevel,
	type FileValidationResult,
	type ValidationEntry,
	type ValidationEntryDetails,
	type ValidationResult,
} from "./validation";

/**
 * Validates the Stream Deck plugin as the specified {@link path}.
 * @param path Path to the plugin.
 * @returns The validation result.
 */
export async function validateStreamDeckPlugin(path: string): Promise<ValidationResult> {
	return validatePlugin({
		path,
		schemas: await getJsonSchemas({ updateCheck: true }),
	});
}

chalk.level = 0;
