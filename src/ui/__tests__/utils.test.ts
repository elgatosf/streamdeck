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
			values: [true && "yes"],
			expected: "yes",
		},
		{
			name: "falsy",
			values: [false && "no", "yes"],
			expected: "yes",
		},
		{
			name: "hyphens",
			values: [true && "container--disabled"],
			expected: "container--disabled",
		},
	])("$name", ({ values, expected }) => {
		expect(cls(...values)).toBe(expected);
	});
});
