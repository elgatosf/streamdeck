import { StdOut } from "../common/stdout";
import { type ValidationEntry, ValidationLevel } from "./entry";
import { FileValidationResult } from "./file-result";

/**
 * Validation result containing a collection of {@link FileValidationResult} grouped by the directory or file path they're associated with.
 */
export class ValidationResult extends Array<FileValidationResult> implements ReadonlyArray<FileValidationResult> {
	/**
	 * Private backing field for {@link ValidationResult.errorCount}.
	 */
	private errorCount = 0;

	/**
	 * Private backing field for {@link ValidationResult.warningCount}.
	 */
	private warningCount = 0;

	/**
	 * Adds a new validation entry to the result.
	 * @param path Directory or file path the entry is associated with.
	 * @param entry Validation entry.
	 */
	public add(path: string, entry: ValidationEntry): void {
		if (entry.level === ValidationLevel.error) {
			this.errorCount++;
		} else {
			this.warningCount++;
		}

		let fileResult = this.find((c) => c.path === path);
		if (fileResult === undefined) {
			fileResult = new FileValidationResult(path);
			this.push(fileResult);
		}

		fileResult.push(entry);
	}

	/**
	 * Determines whether the result contains errors.
	 * @returns `true` when the result has errors.
	 */
	public hasErrors(): boolean {
		return this.errorCount > 0;
	}

	/**
	 * Determines whether the result contains warnings.
	 * @returns `true` when the result has warnings.
	 */
	public hasWarnings(): boolean {
		return this.warningCount > 0;
	}

	/**
	 * Writes the results to the specified {@link output}.
	 * @param output Output to write to.
	 */
	public writeTo(output: StdOut): void {
		// Write each entry.
		if (this.length > 0) {
			output.log();
			this.forEach((collection) => collection.writeTo(output));
		}

		// Both errors and warnings.
		if (this.hasErrors() && this.hasWarnings()) {
			output.error(
				`${pluralize("problem", this.errorCount + this.warningCount)} (${pluralize("error", this.errorCount)}, ${pluralize("warning", this.warningCount)})`,
			);
			return;
		}

		// Only errors.
		if (this.hasErrors()) {
			output.error(`Failed with ${pluralize("error", this.errorCount)}`);
			return;
		}

		// Only warnings.
		if (this.hasWarnings()) {
			output.warn(pluralize("warning", this.warningCount));
			return;
		}

		// Validation was successful.
		output.success("Validation successful");

		/**
		 * Pluralizes the {@link noun} based on the {@link count}.
		 * @param noun Noun to pluralize if required.
		 * @param count Count.
		 * @returns Pluralized or singular representation of the {@link noun}
		 */
		function pluralize(noun: string, count: number): string {
			return `${count} ${count === 1 ? noun : `${noun}s`}`;
		}
	}
}
