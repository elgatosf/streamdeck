/**
 * Checks SDK and CLI documentation, and copies it into packages with cross-package links rewritten for publishing.
 *
 * Usage: node scripts/docs.mts check
 *        node scripts/docs.mts pack [cli|sdk]
 */
import { cp, rm } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

import { checkLinks, type Link, readMarkdownFiles, typeCheck } from "@elgato/markdown";

const root = resolve(import.meta.dirname, "..");
const docsDir = join(root, "docs");
const sections = new Map([
	["cli", "cli"],
	["sdk", "plugin"],
]);

const [command, section, ...extra] = process.argv.slice(2);
if (extra.length > 0) {
	usageError();
}

switch (command) {
	case "check":
		if (section !== undefined) {
			usageError();
		}
		await checkDocs();
		break;
	case "pack":
		if (section !== undefined && !sections.has(section)) {
			usageError();
		}
		for (const [name, packageName] of sections) {
			if (section === undefined || section === name) {
				await packDocs(name, packageName);
			}
		}
		break;
	default:
		usageError();
}

/** Reports invalid command-line arguments without a stack trace. */
function usageError(): never {
	console.error("Usage: node scripts/docs.mts check | pack [cli|sdk]");
	process.exit(1);
}

/** Checks documentation links and SDK TypeScript examples. */
async function checkDocs(): Promise<void> {
	const files = await readMarkdownFiles("**/*.mdx", docsDir);
	const problems = await checkLinks(files, {
		// npmjs.com rejects automated requests.
		ignore: ["https://www.npmjs.com/"],
	});
	for (const problem of problems) {
		console.error(`${problem.link}: ${problem.url}: ${problem.message}`);
	}

	// Partials prefixed with an underscore are generated from the SDK's type declarations.
	const sdkFiles = files.filter(
		(file) => file.path.startsWith(join(docsDir, "sdk") + sep) && !basename(file.path).startsWith("_"),
	);
	const diagnostics = typeCheck(sdkFiles, {
		// Virtual snippets must be within the SDK's rootDir (src); its package self-reference resolves to source.
		cwd: join(root, "packages/plugin/src"),
		tsconfigFile: join(root, "packages/plugin/tsconfig.json"),
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
}

/**
 * Copies documentation and assets into a package, rewriting links to documentation outside that section.
 * @param section Documentation section.
 * @param packageName Workspace package directory.
 */
async function packDocs(section: string, packageName: string): Promise<void> {
	const src = join(docsDir, section);
	const dest = join(root, "packages", packageName, "docs");
	const files = await readMarkdownFiles("**/*", src);

	for (const file of files) {
		file.rewriteLinks((link) => toSiteUrl(link, src));
	}

	await rm(dest, { force: true, recursive: true });
	// Copy assets only; the markdown is written from memory below.
	const markdownPaths = new Set(files.map((file) => file.path));
	await cp(src, dest, { filter: (path) => !markdownPaths.has(path), recursive: true });

	for (const file of files) {
		await file.write(join(dest, relative(src, file.path)));
	}

	console.log(`Packed ${section} documentation into ${relative(root, dest)}.`);
}

/**
 * Gets the docs.elgato.com URL of a relative link targeting another documentation section.
 * @param link Link to rewrite.
 * @param src Documentation section being copied.
 * @returns The URL, or `undefined` when the link should remain as is.
 */
function toSiteUrl(link: Link, src: string): string | undefined {
	// Matches a URL scheme, e.g. `https:`, or an anchor within the page.
	if (/^[a-z][a-z0-9+.-]*:|^#/i.test(link.url)) {
		return undefined;
	}

	const [path = "", hash] = link.url.split("#", 2);
	const target = resolve(dirname(link.file), path);
	if (target === src || target.startsWith(src + sep)) {
		return undefined;
	}

	const [folder = "", ...segments] = relative(docsDir, target).split(sep);
	if (!sections.has(folder)) {
		throw new Error(`Unable to determine the URL of "${link.url}" in ${link.file}:${link.position.start.line}`);
	}

	// Pages are addressed by their path, without the .md or .mdx extension.
	const page = segments.join("/").replace(/\.mdx?$/, "");
	return `https://docs.elgato.com/streamdeck/${folder}/${page}${hash === undefined ? "" : `#${hash}`}`;
}
