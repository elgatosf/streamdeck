/**
 * Checks the SDK documentation, `docs/sdk`: links resolve, and TypeScript code blocks type check against this package.
 *
 * Usage: node scripts/check-docs.ts
 */
import { checkLinks, typeCheck } from "@elgato/markdown";

const problems = await checkLinks({ src: "../../docs/sdk/**/*.mdx" });
for (const problem of problems) {
	console.error(`${problem.link}: ${problem.url}: ${problem.message}`);
}

// Partials prefixed with an underscore are skipped, as they are generated from the SDK's type declarations.
const diagnostics = await typeCheck({
	src: "../../docs/sdk/**/[!_]*.mdx",
	tsconfigFile: "tsconfig.docs.json",
});

for (const diagnostic of diagnostics) {
	console.error(`${diagnostic.link}: TS${diagnostic.code} ${diagnostic.message}`);
}

const count = problems.length + diagnostics.length;
if (count > 0) {
	console.error(`\n${count} problem(s) found in the documentation.`);
	process.exit(1);
}

console.log("Documentation links and code blocks check successfully.");
