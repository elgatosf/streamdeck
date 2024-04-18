import path from "node:path";

import type { isDebugMode } from "../utils";
import { getPluginUUID } from "../utils";

/**
 * Asserts {@link getPluginUUID} is correctly parsed from the current working directory.
 */
describe("getPluginUUID", () => {
	const cases = [
		{
			name: "Parses with .sdPlugin suffix",
			cwd: path.join("tests", "com.elgato.test.sdPlugin"),
			expected: "com.elgato.test"
		},
		{
			name: "Parses without .sdPlugin suffix",
			cwd: path.join("tests", "com.elgato.test"),
			expected: "com.elgato.test"
		}
	];

	it.each(cases)("$name", async ({ cwd, expected }) => {
		// Arrange, act.
		jest.spyOn(process, "cwd").mockReturnValue(cwd);
		const pluginUUID = getPluginUUID();

		// Assert.
		expect(pluginUUID).toBe(expected);
	});
});

/**
 * Asserts {@link isDebugMode} is correctly determined by the process arguments.
 */
describe("isDebugMode", () => {
	let origArgs: string[] = [];
	beforeEach(() => (origArgs = process.execArgv));
	afterEach(() => {
		process.execArgv = origArgs;
		jest.resetModules();
	});

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
			args: ["--inspect=12345"],
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

	it.each(cases)("$args returns $expected", async ({ args, expected }) => {
		// Arrange.
		const { isDebugMode } = (await require("../utils")) as typeof import("../utils");
		process.execArgv = args;

		// Act, assert.
		expect(isDebugMode()).toBe(expected);
	});

	it("Caches result", async () => {
		// Arrange.
		const { isDebugMode } = (await require("../utils")) as typeof import("../utils");
		process.execArgv = ["--inspect", "127.0.0.1"];

		// Act, assert.
		expect(isDebugMode()).toBe(true);

		// Re-arrange, act, assert.
		process.execArgv = [];
		expect(isDebugMode()).toBe(true);
	});
});
