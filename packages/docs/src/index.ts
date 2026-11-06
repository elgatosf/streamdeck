/**
 * Checks SDK and CLI documentation, and builds a copy of each section with cross-section links rewritten for publishing.
 *
 * Usage: node src/index.ts check
 *        node src/index.ts build
 */
import { cp, rm } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

import { checkLinks, type Link, type MarkdownFile, readMarkdownFiles, typeCheck } from "@elgato/markdown";

const docsDir = resolve(import.meta.dirname, "..");
const root = resolve(docsDir, "../..");
const distDir = join(docsDir, "dist");
const sections = ["cli", "sdk"];

const [command, ...extra] = process.argv.slice(2);
if (extra.length > 0) {
	usageError();
}

switch (command) {
	case "check":
		await checkDocs();
		break;
	case "build":
		await rm(distDir, { force: true, recursive: true });
		for (const section of sections) {
			await buildDocs(section);
		}
		break;
	default:
		usageError();
}

/** Reports invalid command-line arguments without a stack trace. */
function usageError(): never {
	console.error("Usage: node src/index.ts check | build");
	process.exit(1);
}

/**
 * Reads the markdown files of a documentation section.
 * @param section Documentation section.
 * @param pattern Glob pattern of files to read.
 * @returns The markdown files.
 */
function readSection(section: string, pattern: string): Promise<MarkdownFile[]> {
	return readMarkdownFiles(pattern, join(docsDir, section));
}

/** Checks documentation links and SDK TypeScript examples. */
async function checkDocs(): Promise<void> {
	const files = (await Promise.all(sections.map((section) => readSection(section, "**/*.mdx")))).flat();
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
		codeBlockDir: join(root, "packages/plugin/src"),
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
 * Builds a documentation section into `dist`, rewriting links to documentation outside that section.
 * @param section Documentation section.
 */
async function buildDocs(section: string): Promise<void> {
	const src = join(docsDir, section);
	const dest = join(distDir, section);
	const files = await readSection(section, "**/*");

	for (const file of files) {
		file.rewriteLinks((link) => toSiteUrl(link, src));
	}

	// Copy assets only; the markdown is written from memory below.
	const markdownPaths = new Set(files.map((file) => file.path));
	await cp(src, dest, { filter: (path) => !markdownPaths.has(path), recursive: true });

	for (const file of files) {
		await file.write(join(dest, relative(src, file.path)));
	}

	console.log(`Built ${section} documentation into ${relative(docsDir, dest)}.`);
}

/**
 * Gets the docs.elgato.com URL of a relative link targeting another documentation section.
 * @param link Link to rewrite.
 * @param src Documentation section being built.
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
	if (!sections.includes(folder)) {
		throw new Error(`Unable to determine the URL of "${link.url}" in ${link.file}:${link.position.start.line}`);
	}

	// Pages are addressed by their path, without the .md or .mdx extension.
	const page = segments.join("/").replace(/\.mdx?$/, "");
	return `https://docs.elgato.com/streamdeck/${folder}/${page}${hash === undefined ? "" : `#${hash}`}`;
}
