/**
 * Generates the documentation references, and inlines code snippets, within `docs/`.
 *
 * Usage:
 *   tsx scripts/docs/generate.ts          # write changes
 *   tsx scripts/docs/generate.ts --check  # fail when the documentation is stale
 */
import { writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { generators } from "./generators/index.js";
import { sync } from "./sync.js";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "../../");
const docsDir = join(packageDir, "docs");
const snippetsDir = join(docsDir, "_snippets");
const check = process.argv.includes("--check");

const results = await sync({ docsDir, generators, snippetsDir });
const changed = results.filter((r) => r.changed);

if (check) {
	if (changed.length > 0) {
		console.error("Documentation is stale, run `pnpm docs:generate` and commit the changes:");
		changed.forEach((r) => console.error(`  ${relative(packageDir, r.path)}`));
		process.exit(1);
	}

	console.log(`Documentation is up to date (${results.length} files checked).`);
} else {
	for (const result of changed) {
		await writeFile(result.path, result.contents, { encoding: "utf-8" });
		console.log(`\x1b[2m${relative(packageDir, result.path)}\x1b[0m`);
	}

	console.log(`Documentation generated (${changed.length} of ${results.length} files updated).`);
}
