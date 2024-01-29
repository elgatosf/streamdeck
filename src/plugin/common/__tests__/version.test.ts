import { Version } from "../version";

/**
 * Asserts string values are correctly parsed to {@link Version}.
 */
describe("serialization", () => {
	/**
	 * Asserts valid version strings.
	 */
	describe("valid", () => {
		const cases = [
			{
				name: "major",
				value: "1",
				expected: [1, 0, 0, 0]
			},
			{
				name: "minor",
				value: "0.2",
				expected: [0, 2, 0, 0]
			},
			{
				name: "patch",
				value: "0.0.3",
				expected: [0, 0, 3, 0]
			},
			{
				name: "build",
				value: "0.0.0.789",
				expected: [0, 0, 0, 789]
			},
			{
				name: "major, minor",
				value: "1.2",
				expected: [1, 2, 0, 0]
			},
			{
				name: "major, patch",
				value: "1.0.13",
				expected: [1, 0, 13, 0]
			},
			{
				name: "major, build",
				value: "1.0.0.99",
				expected: [1, 0, 0, 99]
			},
			{
				name: "major, minor, patch",
				value: "1.2.3",
				expected: [1, 2, 3, 0]
			},
			{
				name: "major, minor, build",
				value: "1.2.0.4",
				expected: [1, 2, 0, 4]
			},
			{
				name: "major, patch, build",
				value: "1.0.3.4",
				expected: [1, 0, 3, 4]
			},
			{
				name: "major, minor, patch, build",
				value: "1.2.3.456",
				expected: [1, 2, 3, 456]
			}
		];

		it.each(cases)("parses $name", ({ value, expected }) => {
			// Arrange, act.
			const version = new Version(value);

			// Assert.
			expect(version.major).toBe(expected[0]);
			expect(version.minor).toBe(expected[1]);
			expect(version.patch).toBe(expected[2]);
			expect(version.build).toBe(expected[3]);
		});

		it.each(cases)("stringifies $name", ({ value }) => {
			// Arrange, act, assert.
			const version = new Version(value);
			expect(`${version}`).toBe(`${version.major}.${version.minor}`);
		});
	});

	/**
	 * Asserts invalid version strings.
	 */
	describe("invalid", () => {
		const cases = [
			{
				name: "empty",
				value: ""
			},
			{
				name: "double period",
				value: "1..2"
			},
			{
				name: "zero before number",
				value: "1.02"
			},
			{
				name: "alphabetical",
				value: "abc"
			},
			{
				name: "tag name",
				value: "1.2.3-beta.1"
			}
		];

		it.each(cases)("$name", ({ value }) => {
			// Arrange, act, assert.
			expect(() => new Version(value)).toThrow(`Invalid format; expected "{major}[.{minor}[.{patch}[.{build}]]]" but was "${value}"`);
		});
	});
});

/**
 * Asserts the comparison of two {@link Version}.
 */
describe("comparison", () => {
	const testCases = [
		{
			name: "same (1)",
			x: "1.1.1.1",
			y: "1.1.1.1",
			expected: 0
		},
		{
			name: "same (2)",
			x: "1.2.3.4",
			y: "1.2.3.4",
			expected: 0
		},
		{
			name: "major version (lesser)",
			x: "1.0.0.0",
			y: "2.0.0.0",
			expected: -1
		},
		{
			name: "major version (greater)",
			x: "2.0.0.0",
			y: "1.0.0.0",
			expected: 1
		},
		{
			name: "minor version (lesser)",
			x: "0.1.0.0",
			y: "0.2.0.0",
			expected: -1
		},
		{
			name: "minor version (greater)",
			x: "0.2.0.0",
			y: "0.1.0.0",
			expected: 1
		},
		{
			name: "patch version (lesser)",
			x: "0.0.1.0",
			y: "0.0.2.0",
			expected: -1
		},
		{
			name: "patch version (greater)",
			x: "0.0.2.0",
			y: "0.0.1.0",
			expected: 1
		},
		{
			name: "build version (lesser)",
			x: "0.0.0.1",
			y: "0.0.0.2",
			expected: -1
		},
		{
			name: "build version (greater)",
			x: "0.0.0.2",
			y: "0.0.0.1",
			expected: 1
		}
	];

	/**
	 * Asserts {@link Version.compareTo}.
	 */
	it.each(testCases)("$name", ({ x, y, expected }) => {
		// Arrange.
		const versionX = new Version(x);
		const versionY = new Version(y);

		// Act, assert.
		expect(versionX.compareTo(versionY)).toBe(expected);
	});
});
