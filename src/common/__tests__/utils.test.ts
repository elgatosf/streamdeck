import { get } from "../utils";

describe("get", () => {
	it("Top-level path", () => {
		const obj = { foo: "bar" };
		expect(get("foo", obj)).toBe("bar");
	});

	it("Nested path", () => {
		const obj = { nested: { number: 13 } };
		expect(get("nested.number", obj)).toBe(13);
	});

	it("Handles falsy values", () => {
		const obj = { falsy: false };
		expect(get("falsy", obj)).toBe(false);
	});

	it("Defaults to undefined", () => {
		const obj = {};
		expect(get("__unknown.__prop", obj)).toBe(undefined);
	});
});

describe("isDebugMode", () => {
	beforeEach(() => jest.resetModules());

	const cases = [
		{
			args: [],
			expected: false
		},
		{
			args: ["--no-addons", "--enable-source-maps"],
			expected: false
		},
		{
			args: ["--inspect=127.0.0.1:1234", "--no-addons", "--enable-source-maps"],
			expected: true
		},
		{
			args: ["--no-addons", "--enable-source-maps", "--inspect=127.0.0.1:1234"],
			expected: true
		},
		{
			args: ["--no-addons", "--inspect=127.0.0.1:1234", "--enable-source-maps"],
			expected: true
		},
		{
			args: ["--inspect"],
			expected: true
		},
		{
			args: ["--inspect=127.0.0.1:1234"],
			expected: true
		},
		{
			args: ["--inspect-brk"],
			expected: true
		},
		{
			args: ["--inspect-brk=127.0.0.1:1234"],
			expected: true
		},
		{
			args: ["--inspect-port=1234"],
			expected: true
		},
		{
			args: ["--inspect-port=127.0.0.1:1234"],
			expected: true
		}
	];

	it.each(cases)("$args is $expected", async ({ args, expected }) => {
		const origArgs = process.execArgv;
		try {
			process.execArgv = args;

			const { isDebugMode } = await require("../utils");
			return expect(isDebugMode).toBe(expected);
		} finally {
			process.execArgv = origArgs;
		}
	});
});
