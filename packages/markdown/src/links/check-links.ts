import { stat } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { MarkdownFile } from "../markdown-file.js";
import { readMarkdown } from "../read-markdown.js";
import { readAnchors } from "./read-anchors.js";
import { type Link, readLinks } from "./read-links.js";

/**
 * File extensions whose anchors can be read.
 */
const MARKDOWN_EXTENSIONS: ReadonlySet<string> = new Set([".md", ".mdx"]);

/**
 * Checks links from the files' shared syntax trees. Relative links must resolve to a file,
 * and when they target an anchor, the anchor must exist within the file. HTTP(S) links are requested, and must not
 * respond with an error status; loopback addresses, e.g. `http://localhost:1234`, document local services and are
 * not requested. Links with other schemes, e.g. `mailto:`, are ignored.
 * @param files Markdown files held in memory. Linked files and imported partials outside this set are loaded on demand.
 * @param options Options.
 * @returns The problems found, with positions relative to their markdown file.
 */
export async function checkLinks(
	files: readonly MarkdownFile[],
	options: CheckLinksOptions = {},
): Promise<LinkProblem[]> {
	const { external = true, ignore = [] } = options;
	const links = files.flatMap((file) => readLinks(file));
	const markdown = new Map(files.map((file) => [file.path, Promise.resolve(file)]));

	const anchors = new Map<string, Promise<Set<string>>>();
	const responses = new Map<string, Promise<string | undefined>>();

	const problems: LinkProblem[] = [];
	for (const link of links) {
		const message = await check(link);
		if (message !== undefined) {
			problems.push(toProblem(link, message));
		}
	}

	return problems;

	/**
	 * Checks the link.
	 * @param link Link to check.
	 * @returns The problem with the link; otherwise `undefined`.
	 */
	async function check(link: Link): Promise<string | undefined> {
		const { url } = link;

		// Matches a URL scheme, e.g. `https:` or `mailto:`.
		if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
			if (!external || !/^https?:/i.test(url) || ignore.some((prefix) => url.startsWith(prefix))) {
				return undefined;
			}

			// Matches a loopback host, e.g. `http://localhost:23654/` or `http://127.0.0.1/`, as the local service is
			// unlikely to be running where the links are checked, e.g. in CI.
			if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?=[:/?#]|$)/i.test(url)) {
				return undefined;
			}

			return request(url);
		}

		if (url.startsWith("/")) {
			return "Absolute path cannot be resolved; use a relative path or a full URL";
		}

		const [path = "", hash] = url.split("#", 2);
		const target = path === "" ? link.file : resolve(dirname(link.file), decodeURIComponent(path.split("?")[0] ?? ""));

		if (!markdown.has(target)) {
			try {
				await stat(target);
			} catch {
				return `File not found: ${target}`;
			}
		}

		if (hash === undefined || !MARKDOWN_EXTENSIONS.has(extname(target).toLowerCase())) {
			return undefined;
		}

		if (!(await getAnchors(target)).has(decodeURIComponent(hash))) {
			return `Anchor not found: #${hash} in ${target}`;
		}

		return undefined;
	}

	/**
	 * Gets the anchors within the file, collecting them once per file.
	 * @param file Path to the markdown file.
	 * @returns The anchors.
	 */
	async function getAnchors(file: string): Promise<Set<string>> {
		let result = anchors.get(file);
		if (result === undefined) {
			result = readAnchors(await load(file), load);
			anchors.set(file, result);
		}

		return result;
	}

	/**
	 * Loads a target or partial once, reusing the supplied files and any files loaded during this check.
	 * @param path Absolute path to the markdown file.
	 * @returns The file held in memory.
	 */
	function load(path: string): Promise<MarkdownFile> {
		let result = markdown.get(path);
		if (result === undefined) {
			result = readMarkdown(path);
			markdown.set(path, result);
		}

		return result;
	}

	/**
	 * Requests the URL, once per URL, to check it responds successfully.
	 * @param url URL to request.
	 * @returns The problem with the response; otherwise `undefined`.
	 */
	function request(url: string): Promise<string | undefined> {
		const key = url.split("#")[0] ?? url;

		let result = responses.get(key);
		if (result === undefined) {
			result = fetchStatus(key);
			responses.set(key, result);
		}

		return result;
	}
}

/**
 * Fetches the URL to determine whether it responds successfully; `HEAD` is attempted first, falling back to `GET` as
 * some servers do not support `HEAD`. A rate limited response (`429`) is inconclusive, and is not a problem.
 * @param url URL to fetch.
 * @returns The problem with the response; otherwise `undefined`.
 */
async function fetchStatus(url: string): Promise<string | undefined> {
	try {
		let response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(15_000) });
		if (!response.ok && response.status !== 429) {
			response = await fetch(url, { method: "GET", signal: AbortSignal.timeout(15_000) });
		}

		// Too many requests means the server is rate limiting the check, not that the link is broken.
		if (response.ok || response.status === 429) {
			return undefined;
		}

		return `HTTP ${response.status} ${response.statusText}`.trim();
	} catch (error) {
		return `Request failed: ${error instanceof Error ? error.message : String(error)}`;
	}
}

/**
 * Creates a problem for the link.
 * @param link Link with the problem.
 * @param message Description of the problem.
 * @returns The problem.
 */
function toProblem(link: Link, message: string): LinkProblem {
	const { column, line } = link.position.start;
	return {
		column,
		file: link.file,
		line,
		link: `${pathToFileURL(link.file)}:${line}:${column}`,
		message,
		url: link.url,
	};
}

/**
 * Options used to check the links within markdown files.
 */
export interface CheckLinksOptions {
	/**
	 * Whether HTTP(S) links are requested to check they respond successfully; defaults to `true`. Loopback addresses,
	 * e.g. `http://localhost:23654/`, are never requested.
	 */
	external?: boolean;

	/**
	 * Prefixes of HTTP(S) links that are not requested, e.g. `https://www.npmjs.com/` for sites that reject
	 * automated requests.
	 */
	ignore?: string[];
}

/**
 * Problem reported for a link, with positions relative to the markdown file.
 */
export interface LinkProblem {
	/**
	 * 1-based column within the markdown file.
	 */
	column: number;

	/**
	 * Absolute path to the markdown file containing the link.
	 */
	file: string;

	/**
	 * 1-based line within the markdown file.
	 */
	line: number;

	/**
	 * File URL of the location within the markdown file, e.g. `file:///C:/docs/README.md:12:5`.
	 */
	link: string;

	/**
	 * Description of the problem.
	 */
	message: string;

	/**
	 * URL of the link, as written in the markdown.
	 */
	url: string;
}
