import { describe, expect, test } from "vitest";

import { parseBoolean, parseNumber } from "../index.js";

/**
 * Provides assertions for {@link parseBoolean}.
 */
describe("parseBoolean", () => {
	/**
	 * Asserts {@link parseBoolean} parses truthy values that represent `true`.
	 */
	test.each([
		{},
		true,
		1,
		"true",
		"any",
	])("%s is true", (value) => {
		expect(parseBoolean(value)).toBe(true);
	});

	/**
	 * Asserts {@link parseBoolean} parses truthy values that represent `false`.
	 */
	test.each([
		undefined,
		null,
		false,
		0,
		"0",
		"false",
	])("%s is false", (value) => {
		expect(parseBoolean(value)).toBe(false);
	});
});

/**
 * Provides assertions for {@link parseNumber}.
 */
describe("parseNumber", () => {
	/**
	 * Asserts {@link parseNumber} with values that can be parsed.
	 */
	test.each([
		{
			value: -1,
			expected: -1,
		},
		{
			value: 0,
			expected: 0,
		},
		{
			value: 1,
			expected: 1,
		},
		{
			value: "13",
			expected: 13,
		},
		{
			value: "25.0",
			expected: 25,
		},
		{
			value: "99.9",
			expected: 99.9,
		},
		{
			value: "100a",
			expected: 100,
		},
	])("parses $value = $expected", ({ value, expected }) => {
		expect(parseNumber(value)).toBe(expected);
	});

	/**
	 * Asserts {@link parseNumber} with values that cannot be parsed.
	 */
	test.each([
		undefined,
		null,
		"false",
		"a123b",
		{},
	])("$value = undefined", (value) => {
		expect(parseNumber(value)).toBeUndefined();
	});
});
