/**
 * Type checks the TypeScript code blocks within the SDK documentation, `docs/sdk`, against this package.
 *
 * Usage: node scripts/check-docs.ts
 */
import { typeCheck } from "@elgato/markdown";

// Partials prefixed with an underscore are skipped, as they are generated from the SDK's type declarations.
const diagnostics = await typeCheck({
	src: "../../docs/sdk/**/[!_]*.mdx",
	tsconfigFile: "tsconfig.docs.json",
});

for (const diagnostic of diagnostics) {
	console.error(`${diagnostic.link}: TS${diagnostic.code} ${diagnostic.message}`);
}

if (diagnostics.length > 0) {
	console.error(`\n${diagnostics.length} problem(s) found in the documentation code blocks.`);
	process.exit(1);
}

console.log("Documentation code blocks type check successfully.");
