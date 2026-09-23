import { expect } from "vitest";

/**
 * Matcher function that asserts the specified error exists in the collection of errors.
 */
expect.extend({
	toHaveError(received: unknown, error: JsonSchemaError) {
		if (!Array.isArray(received)) {
			return {
				message: (): string => `expected ${this.utils.printReceived(received)} to be an array`,
				pass: false,
			};
		}

		for (const item of received) {
			if (item === undefined || typeof item !== "object" || !("instancePath" in item) || !("keyword" in item)) {
				return {
					message: (): string =>
						`expected ${this.utils.printReceived(received)} to be a collection of JSON schema error object`,
					pass: false,
				};
			}

			// When the error was found, we are successful
			if (
				item.keyword === error.keyword &&
				item.instancePath === error.instancePath &&
				this.equals(item.params, error.params)
			) {
				return {
					message: (): string => `success`,
					pass: true,
				};
			}
		}

		return {
			message: (): string =>
				`expected ${this.utils.printReceived(received)} to contain a JSON schema error of ${this.utils.printExpected(error)}`,
			pass: false,
		};
	},
});

/**
 * Represents a JSON error.
 */
type JsonSchemaError = AdditionalPropertyError | ConstError | EnumError | MaximumError | PatternError;

/**
 * Represents a JSON error for the keyword `additionalProperties`.
 */
type AdditionalPropertyError = JsonSchemaBaseError<
	"additionalProperties",
	{
		/**
		 * Name of the property that should not be present.
		 */
		additionalProperty: string;
	}
>;

/**
 * Represents a JSON error for the keyword `const`.
 */
type ConstError = JsonSchemaBaseError<
	"const",
	{
		/**
		 * The allowed value.
		 */
		allowedValue: unknown;
	}
>;

/**
 * Represents a JSON error for the keyword `enum`.
 */
type EnumError = JsonSchemaBaseError<
	"enum",
	{
		/**
		 * The allowed values.
		 */
		allowedValues: unknown[];
	}
>;

/**
 * Represents a JSON error for the keyword `maximum`.
 */
type MaximumError = JsonSchemaBaseError<
	"maximum",
	{
		/**
		 * The comparison.
		 */
		comparison: "<=";

		/**
		 * The inclusive maximum limit.
		 */
		limit: number;
	}
>;

/**
 * Represents a JSON error for the keyword `pattern`.
 */
type PatternError = JsonSchemaBaseError<
	"pattern",
	{
		/**
		 * Expected pattern.
		 */
		pattern: string;
	}
>;

/**
 * Represents a base JSON schema error.
 */
type JsonSchemaBaseError<TKeyword, TParams> = {
	/**
	 * Path to the instance of the error.
	 */
	instancePath: string;

	/**
	 * Keyword of the error.
	 */
	keyword: TKeyword;

	/**
	 * Parameters that define the validation rule.
	 */
	params: TParams;
};

declare module "vitest" {
	interface Matchers {
		/**
		 * Asserts the collection of errors includes a specify error.
		 * @param expected Expected error.
		 */
		toHaveError(expected: JsonSchemaError): void;
	}
}
