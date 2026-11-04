import { describe, expect, test } from "vitest";

import { tsCodeBlock } from "../markdown/ts-code-block.js";

describe("tsCodeBlock", () => {
	/**
	 * Asserts complete declarations are formatted with the Markdown indentation from the shared oxfmt configuration.
	 */
	test("formats declarations", async () => {
		await expect(
			tsCodeBlock("export type Example={\nreadonly field :{value:string;flag?:boolean};\n}"),
		).resolves.toBe(
			"```typescript\nexport type Example = {\n    readonly field: { value: string; flag?: boolean };\n};\n```",
		);
	});

	/**
	 * Asserts property signatures are formatted in an interface without exposing the wrapper or its indentation.
	 */
	test("formats property signatures", async () => {
		await expect(tsCodeBlock('readonly "x-y"?:{value:string;flag?:boolean};', "property")).resolves.toBe(
			'```typescript\nreadonly "x-y"?: { value: string; flag?: boolean };\n```',
		);
	});

	/**
	 * Asserts enum members are formatted in an enum without exposing the wrapper.
	 */
	test("formats enum members", async () => {
		await expect(tsCodeBlock('"A B"=1<<3', "member")).resolves.toBe('```typescript\n"A B" = 1 << 3,\n```');
	});

	/**
	 * Asserts removing wrapper indentation does not alter the contents of multiline template literal types.
	 */
	test("preserves multiline literal contents", async () => {
		await expect(tsCodeBlock("text?: `first\n    ${string}\n        last`;", "property")).resolves.toBe(
			"```typescript\ntext?: `first\n    ${string}\n        last`;\n```",
		);
		await expect(tsCodeBlock("Text=`first\n    second\nlast`", "member")).resolves.toBe(
			"```typescript\nText = `first\n    second\nlast`,\n```",
		);
	});

	/**
	 * Asserts formatter diagnostics are surfaced instead of emitting an unformatted code block.
	 */
	test("reports invalid TypeScript", async () => {
		await expect(tsCodeBlock("name?: {", "property")).rejects.toThrow("Unable to format TypeScript code block");
	});
});
