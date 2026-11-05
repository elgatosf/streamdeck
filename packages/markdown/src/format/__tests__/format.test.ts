import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { format } from "../format.js";

describe("format", () => {
	let dir: string;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "format-"));
	});

	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	/**
	 * Writes the Markdown to a file within the temporary directory.
	 * @param markdown Markdown.
	 * @returns Path to the file.
	 */
	function write(markdown: string): string {
		const target = join(dir, "README.md");
		writeFileSync(target, markdown);
		return target;
	}

	/**
	 * Asserts the content between markers is replaced, separated from the markers by blank lines, and markers are kept.
	 */
	test("replaces the content of sections, keeping the markers", async () => {
		const target = write(
			[
				"# Title",
				"",
				"<!-- format:start a -->",
				"Old A",
				"<!-- format:end a -->",
				"",
				"Between",
				"",
				"<!--format:start b-->",
				"",
				"Old B",
				"",
				"<!--format:end b-->",
				"",
			].join("\n"),
		);

		await expect(format({ path: target, data: { a: "New A", b: "\n\n## New B\n\nText\n" } })).resolves.toBeUndefined();
		expect(readFileSync(target, "utf8")).toBe(
			[
				"# Title",
				"",
				"<!-- format:start a -->",
				"",
				"New A",
				"",
				"<!-- format:end a -->",
				"",
				"Between",
				"",
				"<!--format:start b-->",
				"",
				"## New B",
				"",
				"Text",
				"",
				"<!--format:end b-->",
				"",
			].join("\n"),
		);
	});

	/**
	 * Asserts data can be supplied as a `Map`.
	 */
	test("accepts a map", async () => {
		const target = write("<!-- format:start a -->\n<!-- format:end a -->\n");
		await format({ path: target, data: new Map([["a", "A"]]) });
		expect(readFileSync(target, "utf8")).toBe("<!-- format:start a -->\n\nA\n\n<!-- format:end a -->\n");
	});

	/**
	 * Asserts formatting formatted Markdown with the same data does not change it.
	 */
	test("is idempotent", async () => {
		const target = write("<!-- format:start a -->\nOld\n<!-- format:end a -->\n");
		await format({ path: target, data: { a: "New" } });
		const once = readFileSync(target, "utf8");

		await format({ path: target, data: { a: "New" } });
		expect(readFileSync(target, "utf8")).toBe(once);
	});

	/**
	 * Asserts empty content empties the section.
	 */
	test("empties sections with empty content", async () => {
		const target = write("<!-- format:start a -->\nOld\n<!-- format:end a -->\n");
		await format({ path: target, data: { a: "" } });
		expect(readFileSync(target, "utf8")).toBe("<!-- format:start a -->\n\n<!-- format:end a -->\n");
	});

	/**
	 * Asserts sections without data are left unchanged.
	 */
	test("leaves sections without data unchanged", async () => {
		const markdown =
			"<!-- format:start a -->\nA\n<!-- format:end a -->\n<!-- format:start b -->\nB\n<!-- format:end b -->\n";
		const target = write(markdown);

		await format({ path: target, data: {} });
		expect(readFileSync(target, "utf8")).toBe(markdown);
		await format({ path: target, data: { b: "New" } });
		expect(readFileSync(target, "utf8")).toBe(
			"<!-- format:start a -->\nA\n<!-- format:end a -->\n<!-- format:start b -->\n\nNew\n\n<!-- format:end b -->\n",
		);
	});

	/**
	 * Asserts every section with the identifier is replaced.
	 */
	test("replaces every section with the same identifier", async () => {
		const target = write(
			"<!-- format:start a -->\n<!-- format:end a -->\n\n<!-- format:start a -->\n<!-- format:end a -->\n",
		);
		await format({ path: target, data: { a: "A" } });
		expect(readFileSync(target, "utf8")).toBe(
			"<!-- format:start a -->\n\nA\n\n<!-- format:end a -->\n\n<!-- format:start a -->\n\nA\n\n<!-- format:end a -->\n",
		);
	});

	/**
	 * Asserts markers are found when CommonMark groups them with an adjacent HTML block.
	 */
	test("finds section markers adjacent to top-level HTML blocks", async () => {
		const target = write("<!-- format:start a -->\n<div>Old</div>\n<!-- format:end a -->\n");

		await format({ path: target, data: { a: "New" } });
		expect(readFileSync(target, "utf8")).toBe("<!-- format:start a -->\n\nNew\n\n<!-- format:end a -->\n");
	});

	/**
	 * Asserts content uses the line endings of the file.
	 */
	test("preserves CRLF line endings", async () => {
		const target = write("<!-- format:start a -->\r\nOld\r\n<!-- format:end a -->\r\n");
		await format({ path: target, data: { a: "One\nTwo" } });
		expect(readFileSync(target, "utf8")).toBe(
			"<!-- format:start a -->\r\n\r\nOne\r\nTwo\r\n\r\n<!-- format:end a -->\r\n",
		);
	});

	/**
	 * Asserts markers within code blocks, block quotes, and paragraphs are ignored.
	 */
	test("ignores markers that are not top-level", async () => {
		const markdown = [
			"```md",
			"<!-- format:start a -->",
			"<!-- format:end a -->",
			"```",
			"",
			"> <!-- format:start b -->",
			"> <!-- format:end b -->",
			"",
			"Inline <!-- format:start c --> text <!-- format:end c -->",
			"",
		].join("\n");
		const target = write(markdown);

		await format({ path: target, data: {} });
		expect(readFileSync(target, "utf8")).toBe(markdown);
		await expect(format({ path: target, data: { a: "A" } })).rejects.toThrow(
			`Unable to find section "a" in ${target}.`,
		);
		expect(readFileSync(target, "utf8")).toBe(markdown);
	});

	/**
	 * Asserts data without a matching section throws.
	 */
	test("throws when data has no matching section", async () => {
		const target = write("# Title\n");
		await expect(format({ path: target, data: { missing: "" } })).rejects.toThrow(
			`Unable to find section "missing" in ${target}.`,
		);
		expect(readFileSync(target, "utf8")).toBe("# Title\n");
	});

	/**
	 * Asserts a start marker without an end marker throws.
	 */
	test("throws when a section does not end", async () => {
		const target = write("# Title\n\n<!-- format:start a -->\n");
		await expect(format({ path: target, data: {} })).rejects.toThrow(`Section "a" does not end at ${target}:3.`);
		expect(readFileSync(target, "utf8")).toBe("# Title\n\n<!-- format:start a -->\n");
	});

	/**
	 * Asserts an end marker without a matching start marker throws.
	 */
	test("throws when a section ends without starting", async () => {
		const target = write("<!-- format:start a -->\n<!-- format:end b -->\n");
		await expect(format({ path: target, data: {} })).rejects.toThrow(
			`Section "b" ends without starting at ${target}:2.`,
		);
		expect(readFileSync(target, "utf8")).toBe("<!-- format:start a -->\n<!-- format:end b -->\n");
	});

	/**
	 * Asserts a start marker within an open section throws.
	 */
	test("throws when sections are nested", async () => {
		const target = write("<!-- format:start a -->\n<!-- format:start b -->\n");
		await expect(format({ path: target, data: {} })).rejects.toThrow(
			`Section "b" starts within section "a" at ${target}:2.`,
		);
		expect(readFileSync(target, "utf8")).toBe("<!-- format:start a -->\n<!-- format:start b -->\n");
	});

	/**
	 * Asserts a file that cannot be read throws.
	 */
	test("throws when the file cannot be read", async () => {
		await expect(format({ path: join(dir, "missing.md"), data: {} })).rejects.toMatchObject({ code: "ENOENT" });
	});
});
