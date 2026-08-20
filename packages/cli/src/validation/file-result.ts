import chalk from "chalk";

import { OrderedArray } from "../common/ordered-array";
import { StdOut } from "../common/stdout";
import type { ValidationEntry } from "./entry";

/**
 * Provides validation results for a specific file path.
 */
export class FileValidationResult extends OrderedArray<ValidationEntry> {
	/**
	 * Tracks the padding required for the location of a validation entry, i.e. the text before the entry level.
	 */
	#padding = 0;

	/**
	 * Initializes a new instance of the {@link FileValidationResult} class.
	 * @param path Path that groups the entries together.
	 */
	constructor(public readonly path: string) {
		super(
			(x) => x.level,
			(x) => x.details?.location?.line ?? Infinity,
			(x) => x.details?.location?.column ?? Infinity,
			(x) => x.message,
		);
	}

	/**
	 * Adds the specified {@link entry} to the collection.
	 * @param entry Entry to add.
	 * @returns New length of the validation results.
	 */
	public push(entry: ValidationEntry): number {
		this.#padding = Math.max(this.#padding, entry.location.length);
		return super.push(entry);
	}

	/**
	 * Writes the entry collection to the {@link output}.
	 * @param output Output to write to.
	 */
	public writeTo(output: StdOut): void {
		if (this.length === 0) {
			return;
		}

		output.log(chalk.underline(this.path));
		if (chalk.level > 0) {
			output.log(chalk.hidden(this.path));
		} else {
			output.log();
		}

		this.forEach((entry) => output.log(entry.toSummary(this.#padding)));
		output.log();
	}
}
