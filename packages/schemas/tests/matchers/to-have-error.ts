import type { MatcherFunction } from "expect";

/**
 * Matcher function that asserts the specified error exists in the collection of errors.
 * @param actual Collection of JSON validation errors.
 * @param error Expected error.
 * @returns The matcher result.
 */
export const toHaveError: MatcherFunction<[error: AdditionalPropertyError]> = function (
	actual: unknown,
	error: JsonSchemaError,
) {
	if (!Array.isArray(actual)) {
		return {
			message: () => `expected ${this.utils.printReceived(actual)} to be an array`,
			pass: false,
		};
	}

	for (const item of actual) {
		if (item === undefined || typeof item !== "object" || !("instancePath" in item) || !("keyword" in item)) {
			return {
				message: () => `expected ${this.utils.printReceived(actual)} to be a collection of JSON schema error object`,
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
				message: () => `success`,
				pass: true,
			};
		}
	}

	return {
		message: () =>
			`expected ${this.utils.printReceived(actual)} to contain a JSON schema error of ${this.utils.printExpected(error)}`,
		pass: false,
	};
};

/**
 * Represents a JSON error.
 */
type JsonSchemaError = AdditionalPropertyError | ConstError | EnumError | PatternError;

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

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace jest {
		interface AsymmetricMatchers {
			toHaveError(error: JsonSchemaError): void;
		}
		interface Matchers<R> {
			toHaveError(error: JsonSchemaError): R;
		}
	}
}
