import { cls } from "../utils";

/**
 * Provides assertions for the {@link cls} utility function.
 */
describe("cls", () => {
	test.each([
		{
			name: "empty is undefined",
			values: [],
			expected: "",
		},
		{
			name: "single string",
			values: ["test"],
			expected: "test",
		},
		{
			name: "multiple strings",
			values: ["foo", "bar"],
			expected: "foo bar",
		},
		{
			name: "truthy",
			// eslint-disable-next-line no-constant-binary-expression
			values: [1 && "yes"],
			expected: "yes",
		},
		{
			name: "falsy undefined",
			// eslint-disable-next-line no-constant-binary-expression
			values: [undefined && "no", "yes"],
			expected: "yes",
		},
		{
			name: "falsy null",
			// eslint-disable-next-line no-constant-binary-expression
			values: [null && "no", "yes"],
			expected: "yes",
		},
		{
			name: "falsy 0",
			// eslint-disable-next-line no-constant-binary-expression
			values: [0 && "no", "yes"],
			expected: "yes",
		},
		{
			name: "hyphens",
			// eslint-disable-next-line no-constant-binary-expression
			values: [true && "container--disabled"],
			expected: "container--disabled",
		},
	])("$name", ({ values, expected }) => {
		expect(cls(...values)).toBe(expected);
	});
});
