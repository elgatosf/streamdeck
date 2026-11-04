import { cp, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";

/**
 * Copies the SDK documentation, `docs/sdk`, into this package's `docs` folder for publishing. Links to documentation
 * outside the folder, e.g. the CLI, are rewritten to their location on docs.elgato.com.
 *
 * Usage: node scripts/pack-docs.ts
 */
import { findMarkdownFiles, type Link, rewriteLinks } from "@elgato/markdown";

const docsDir = resolve(import.meta.dirname, "../../../docs");
const src = join(docsDir, "sdk");
const dest = resolve(import.meta.dirname, "../docs");

// Location of each documentation folder on docs.elgato.com.
const sites = new Map([
	["cli", "https://docs.elgato.com/streamdeck/cli"],
	["sdk", "https://docs.elgato.com/streamdeck/sdk"],
]);

await rm(dest, { force: true, recursive: true });
await cp(src, dest, { recursive: true });

for (const file of await findMarkdownFiles("**/*", src)) {
	await writeFile(join(dest, relative(src, file)), await rewriteLinks(file, toSiteUrl));
}

/**
 * Gets the docs.elgato.com URL of a relative link that targets documentation outside of the copied folder.
 * @param link Link to rewrite.
 * @returns The URL, or `undefined` when the link should remain as is.
 */
function toSiteUrl(link: Link): string | undefined {
	// Matches a URL scheme, e.g. `https:`, or an anchor within the page.
	if (/^[a-z][a-z0-9+.-]*:|^#/i.test(link.url)) {
		return undefined;
	}

	const [path = "", hash] = link.url.split("#", 2);
	const target = resolve(dirname(link.file), path);
	if (target.startsWith(src + sep)) {
		return undefined;
	}

	const [folder = "", ...segments] = relative(docsDir, target).split(sep);
	const site = sites.get(folder);
	if (site === undefined) {
		throw new Error(`Unable to determine the URL of "${link.url}" in ${link.file}:${link.position.start.line}`);
	}

	// Pages are addressed by their path, without the extension.
	const page = segments.join("/").replace(/\.mdx?$/, "");
	return `${site}/${page}${hash === undefined ? "" : `#${hash}`}`;
}
