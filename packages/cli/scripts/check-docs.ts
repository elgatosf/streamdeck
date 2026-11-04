/**
 * Checks the links within the CLI documentation, `docs/cli`, resolve.
 *
 * Usage: node scripts/check-docs.ts
 */
import { checkLinks } from "@elgato/markdown";

// npmjs.com rejects automated requests.
const problems = await checkLinks({ ignore: ["https://www.npmjs.com/"], src: "../../docs/cli/**/*.mdx" });

for (const problem of problems) {
	console.error(`${problem.link}: ${problem.url}: ${problem.message}`);
}

if (problems.length > 0) {
	console.error(`\n${problems.length} problem(s) found in the documentation links.`);
	process.exit(1);
}

console.log("Documentation links check successfully.");
