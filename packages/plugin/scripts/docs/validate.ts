/**
 * Validates the documentation within `docs/`:
 * - Every page starts with a level one heading (the title), optionally preceded by frontmatter.
 * - Every directory of pages has a `_category_.json` with valid metadata.
 * - Frontmatter only defines `sidebar_label`, `sidebar_position`, and `unlisted`.
 * - Relative links resolve to a page, and anchors resolve to a heading, or its explicit `{#id}` identifier.
 * - Links to other sites are absolute URLs, never site-root paths.
 * - Images resolve to a file.
 * - Every page is linked from the index of its version.
 *
 * Usage: tsx scripts/docs/validate.ts
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = join(dirname(fileURLToPath(import.meta.url)), "../../");
const docsDir = join(packageDir, "docs");
const errors: string[] = [];

/**
 * Gets the files within the directory, recursively, excluding directories prefixed with an underscore.
 * @param dir Directory to search.
 * @returns Paths of the files.
 */
function getFiles(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (!entry.name.startsWith("_")) {
				files.push(...getFiles(path));
			}
		} else {
			files.push(path);
		}
	}

	return files.sort();
}

/**
 * Creates a slug for the heading text, mirroring GitHub's slugger.
 * @param text Heading text.
 * @returns The slug.
 */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.replaceAll(/`([^`]*)`/g, "$1") // inline code
		.replaceAll(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links
		.replaceAll(/[^\p{L}\p{N} _-]/gu, "")
		.replaceAll(" ", "-");
}

/**
 * Gets the anchors defined within the markdown; headings are slugified unless they define an explicit `{#id}`.
 * @param markdown Markdown contents.
 * @returns Set of anchors.
 */
function getAnchors(markdown: string): Set<string> {
	const anchors = new Set<string>();
	const slugCounts = new Map<string, number>();
	const lines = markdown.split("\n");
	let inCode = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (/^\s*```/.test(line)) {
			inCode = !inCode;
			continue;
		}

		if (inCode) {
			continue;
		}

		const heading = line.match(/^#{1,6} (.+?)\s*$/);
		if (heading) {
			// Explicit identifiers, for example `### Installation {#eslint-installation}`.
			const explicit = heading[1].match(/\{#([\w-]+)\}$/);
			if (explicit) {
				anchors.add(explicit[1]);
				continue;
			}

			const slug = slugify(heading[1]);
			const count = slugCounts.get(slug) ?? 0;
			slugCounts.set(slug, count + 1);
			anchors.add(count === 0 ? slug : `${slug}-${count}`);
		}
	}

	return anchors;
}

/**
 * Reads a markdown file, normalizing line endings to LF so that patterns match on every platform.
 * @param path Path of the file.
 * @returns Contents of the file.
 */
function readMarkdown(path: string): string {
	return readFileSync(path, { encoding: "utf-8" }).replaceAll("\r\n", "\n");
}

/**
 * Keys permitted within a page's frontmatter.
 */
const frontmatterKeys = ["sidebar_label", "sidebar_position", "unlisted"];

const files = getFiles(docsDir);
const pages = files.filter((f) => f.endsWith(".md"));
const anchorsByPage = new Map<string, Set<string>>();
for (const page of pages) {
	anchorsByPage.set(page, getAnchors(readMarkdown(page)));
}

// Category metadata.
const dirs = new Set(pages.map((p) => dirname(p)));
for (const dir of dirs) {
	if (dir === docsDir || /^v\d+$/.test(relative(docsDir, dir))) {
		continue; // the root, and version roots, are not categories
	}

	const path = join(dir, "_category_.json");
	if (!existsSync(path)) {
		errors.push(`${relative(packageDir, dir)}: missing _category_.json`);
		continue;
	}

	try {
		const category = JSON.parse(readFileSync(path, { encoding: "utf-8" }));
		if (typeof category.position !== "number")
			errors.push(`${relative(packageDir, path)}: "position" must be a number`);
		if (typeof category.label !== "string") errors.push(`${relative(packageDir, path)}: "label" must be a string`);
		if (typeof category.collapsible !== "boolean")
			errors.push(`${relative(packageDir, path)}: "collapsible" must be a boolean`);
		if ("collapsed" in category && typeof category.collapsed !== "boolean")
			errors.push(`${relative(packageDir, path)}: "collapsed" must be a boolean`);
		if ("className" in category && typeof category.className !== "string")
			errors.push(`${relative(packageDir, path)}: "className" must be a string`);
	} catch (err) {
		errors.push(`${relative(packageDir, path)}: invalid JSON (${(err as Error).message})`);
	}
}

// Pages.
const linkedPages = new Set<string>();
for (const page of pages) {
	const name = relative(packageDir, page);
	const markdown = readMarkdown(page);

	// Frontmatter; optional, and limited to known keys.
	const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---\n/);
	for (const line of frontmatter?.[1].split("\n") ?? []) {
		const key = line.match(/^(\w+):/)?.[1];
		if (key && !frontmatterKeys.includes(key)) {
			errors.push(`${name}: unknown frontmatter key "${key}", expected one of ${frontmatterKeys.join(", ")}`);
		}
	}

	// Title; the first content after the optional frontmatter must be a level one heading.
	const body = markdown.replace(/^---\n[\s\S]*?\n---\n/, "").replace(/^\n+/, "");
	if (!body.startsWith("# ")) {
		errors.push(`${name}: the page must start with a level one heading`);
	}

	// Links and images; code blocks are skipped.
	const prose = markdown.replaceAll(/```[\s\S]*?```/g, "").replaceAll(/`[^`\n]*`/g, "");
	for (const [, isImage, target] of prose.matchAll(/(!?)\[[^\]]*\]\(([^)\s]+)\)/g)) {
		if (/^(https?:|mailto:)/.test(target)) {
			continue;
		}

		if (target.startsWith("/")) {
			errors.push(
				`${name}: site-root link "${target}" does not resolve outside the website; use an absolute https://docs.elgato.com URL`,
			);
			continue;
		}

		const [path, hash] = target.split("#");
		const resolved = path ? resolve(dirname(page), path) : page;
		if (!isImage && basename(page) === "index.md") {
			linkedPages.add(resolved);
		}

		if (isImage) {
			if (!existsSync(resolved)) errors.push(`${name}: image not found "${target}"`);
			continue;
		}

		if (!existsSync(resolved) || statSync(resolved).isDirectory()) {
			errors.push(`${name}: link not found "${target}"`);
			continue;
		}

		if (hash !== undefined && resolved.endsWith(".md")) {
			const anchors = anchorsByPage.get(resolved) ?? getAnchors(readFileSync(resolved, { encoding: "utf-8" }));
			if (!anchors.has(hash)) {
				errors.push(`${name}: anchor not found "${target}"`);
			}
		}
	}
}

// Every page must be reachable from the index of its version.
for (const page of pages) {
	if (basename(page) !== "index.md" && !linkedPages.has(page)) {
		errors.push(`${relative(packageDir, page)}: not linked from the index of its version`);
	}
}

if (errors.length > 0) {
	console.error(`Documentation validation failed with ${errors.length} error(s):`);
	errors.forEach((e) => console.error(`  ${e}`));
	process.exit(1);
}

console.log(`Documentation is valid (${pages.length} pages, ${dirs.size} directories).`);
