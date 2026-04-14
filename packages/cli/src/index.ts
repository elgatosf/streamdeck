import chalk from "chalk";

export {
	ValidationLevel,
	type FileValidationResult,
	type ValidationEntry,
	type ValidationEntryDetails,
	type ValidationResult,
} from "./validation";

export { validatePlugin as validateStreamDeckPlugin } from "./validation/plugin";

chalk.level = 0;
