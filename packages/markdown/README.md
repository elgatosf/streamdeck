<div align="center">

# @elgato/markdown

Tools for working with Markdown files.

[Elgato homepage](https://elgato.com)

</div>

`@elgato/markdown` is a private workspace package for:

- Generating documentation from TypeScript types and JSDoc.
- Replacing named sections in Markdown files.
- Reading, checking, and rewriting links in Markdown and MDX.
- Type-checking fenced TypeScript code blocks in Markdown and MDX.

## Setup

The package requires Node.js 24 or later and TypeScript `^5.8.3`. From a consuming workspace package, add it as a development dependency:

```sh
pnpm add -D "@elgato/markdown@workspace:^"
```

Build it from the workspace root before running the examples:

```sh
pnpm --filter @elgato/markdown build
```

Save the TypeScript examples as `.mts` files to use ES modules and top-level `await`, then run them with Node.js, e.g. `node generate-docs.mts`.

## Generate type documentation

Load a TypeScript file, generate documentation for a type it declares or re-exports, and write the result:

```ts
import { writeFile } from "node:fs/promises";

import { createDocumentationSource } from "@elgato/markdown";

const source = createDocumentationSource({
    src: "src/index.ts",
    tsconfigFile: "tsconfig.json",
});

const markdown = await source.generate({ typeName: "Manifest", format: "flat" });
await writeFile("manifest.md", markdown);
```

Reuse `source` to generate multiple types or formats:

- Each type and its references are discovered once per source.
- Computed and inherited properties are resolved.
- TypeScript snippets are formatted with oxfmt.

### Source options

| Option         | Description                                                                            |
| -------------- | -------------------------------------------------------------------------------------- |
| `src`          | Required path to the TypeScript file declaring or re-exporting the types.              |
| `tsconfigFile` | Optional tsconfig used to resolve types. Without it, strict compiler options are used. |
| `tags`         | Optional iterable of JSDoc tag names, without `@`. Replaces the default selection.     |

- Paths are relative to the current working directory.
- Default JSDoc tags: `@default`, `@defaultValue`, `@deprecated`, `@remarks`, `@see`, `@since`.

### Generation options

Pass these to `source.generate`:

| Option          | Description                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `typeName`      | Required name of the type to document.                                                                                 |
| `format`        | Required: `flat` for property headings, or `table` for property tables.                                                |
| `overview`      | `collapsed` (default) references object types by name; `expanded` shows their properties inline.                       |
| `headingOffset` | Non-negative integer; default `0` starts at `#`, while `2` starts at `###`. Use at most `3` for flat or `4` for table. |

- Overviews are included for the root and referenced object types.
- `expanded` inlines object structures; enums, literal unions, and recursive references remain named.

<!-- Dotted paths keep inline members identifiable without turning anonymous object types into separate chapters. -->

- Inline object properties use dotted paths, e.g. `font.size`, including within arrays, tuples, and unions. Recursive paths stop at the first repeated type. Flat output links nested properties to their parent.
- Headings use unique, lowercase, hyphenated IDs, e.g. `{#manifest-actions}`; duplicate IDs get numeric suffixes. Use a renderer that supports explicit heading IDs, such as Docusaurus or Astro with a heading-ID plugin. MDX may need additional configuration; table rows use HTML anchors.
- Creating a source throws if files cannot be read. Generation rejects for missing types, unsupported formats, invalid heading offsets, or formatting errors.

## Format Markdown sections

Add matching markers on their own lines in a Markdown file:

```md
# Manifest

<!-- format:start manifest -->

This content is replaced.

<!-- format:end manifest -->
```

Replace the content between the markers by passing their ID to `format`, which overwrites the file:

```ts
import { format } from "@elgato/markdown";

await format({
    path: "README.md",
    data: { manifest: "## Properties" },
});
```

- `path` is relative to the current working directory. `data` maps section IDs to replacement content.
- Pass the Markdown from `source.generate` as content to insert generated documentation.
- `format` returns `Promise<void>`, keeps markers, leaves sections without data unchanged, and updates every section sharing an ID.

<!-- Top-level-only markers avoid treating examples and quoted Markdown as instructions to rewrite content. -->

- Only top-level markers are recognized; markers in code blocks, lists, block quotes, and paragraphs are ignored.
- Unknown IDs, unmatched markers, nested sections, and read/write errors reject. Validation errors occur before the file is written.

## Read, Check, and Write

Read files once, check their links and TypeScript examples, then rewrite and output them. Each `MarkdownFile` holds its source path, content, and syntax tree in memory. Checks reuse that tree; edits invalidate it, and it is parsed again only if needed. Source files are unchanged until explicitly written.

```ts
import { join, relative, resolve } from "node:path";

import { checkLinks, readMarkdownFiles, typeCheck } from "@elgato/markdown";

const source = resolve("docs");
const files = await readMarkdownFiles("**/*.{md,mdx}", source);
const linkProblems = await checkLinks(files, { external: false });
const typeDiagnostics = typeCheck(files, { tsconfigFile: "tsconfig.json" });

if (linkProblems.length > 0 || typeDiagnostics.length > 0) {
    throw new Error("Documentation checks failed");
}

for (const file of files) {
    file.rewriteLinks((link) => {
        return link.url.startsWith("../cli/") ? `https://example.com/${link.url.slice(3)}` : undefined;
    });
    await file.write(join("dist/docs", relative(source, file.path)));
}
```

`readMarkdownFiles(pattern, baseDir)` matches `.md` and `.mdx` files using Node.js' built-in `glob`, sorted by path. `baseDir` is the directory the glob is resolved from and defaults to the current working directory. It throws if no files match, a file cannot be read, or an MDX file cannot be parsed. Use `readMarkdown(path)` for one file, or `new MarkdownFile(path, content)` for content already in memory.

## Type Checking

`typeCheck(files, options)` checks fenced TypeScript code blocks together in one TypeScript program, returning diagnostics linked to the source files. `file.typeCheck(options)` checks a single file.

```ts
const diagnostics = typeCheck(files, {
    codeBlockDir: process.cwd(),
    tsconfigFile: "tsconfig.json",
});

for (const diagnostic of diagnostics) {
    console.error(`${diagnostic.link}: TS${diagnostic.code} ${diagnostic.message}`);
}

if (diagnostics.length > 0) {
    process.exitCode = 1;
}
```

### Type-Checked Code Blocks

Fenced code blocks labeled `ts`, `typescript`, `tsx`, `mts`, or `cts` are type-checked; language labels are case-insensitive. JavaScript, unlabeled, and indented code blocks are ignored, as are blocks with `nocheck` in their fence metadata. MDX code blocks inside JSX elements are included.

Each block is checked as a separate module located in `codeBlockDir`, independently of the Markdown file's location. Imports and module settings are resolved from that directory using the compiler options in the specified tsconfig. If `rootDir` is restricted, set `codeBlockDir` inside it or choose a tsconfig whose `rootDir` includes it.

| Option         | Description                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------- |
| `codeBlockDir` | Directory used to resolve the tsconfig and code block imports. Defaults to `process.cwd()`. |
| `tsconfigFile` | Tsconfig path relative to `codeBlockDir`. Defaults to `tsconfig.json`.                      |

### Diagnostics

Each `CodeBlockDiagnostic` includes:

- `category` and `code` from TypeScript.
- `file`, the absolute source path of the Markdown file.
- `line` and `column`, 1-based positions within the current content.
- `link`, a file URL with the diagnostic position.
- `message`, the TypeScript diagnostic message.

The function throws if a required tsconfig cannot be read or is invalid, or edited MDX cannot be parsed.

## Link Checking

`checkLinks(files, options)` checks links using the files already in memory. Linked Markdown files and imported partials outside the supplied set are loaded on demand, once per check. HTTP responses and target anchors are also shared across the batch. `file.checkLinks(options)` checks a single file.

Relative links must resolve to a file, and when they target an anchor, the anchor must exist within that file: a heading (by slug or custom `{#id}`), a JSX element's `id`, or either of those within an MDX file imported as a partial. HTTP(S) links are requested, and must not respond with an error status; a rate limited response (`429`) is not treated as an error. Loopback addresses, e.g. `http://localhost:23654/`, are never requested.

```ts
const problems = await checkLinks(files, {
    ignore: ["https://www.npmjs.com/"],
});

for (const problem of problems) {
    console.log(`${problem.link}: ${problem.url}: ${problem.message}`);
}
```

| Option     | Description                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------- |
| `external` | Whether HTTP(S) links are requested. Defaults to `true`.                                     |
| `ignore`   | Prefixes of HTTP(S) links that are not requested, e.g. sites that reject automated requests. |

Each `LinkProblem` includes the `file`, `line`, `column`, and `link` of the link, its `url`, and a `message` describing the problem. Positions refer to the current in-memory content; check before rewriting if diagnostics should refer to the original source.

## Rewriting, Formatting, and Output

`file.rewriteLinks(callback)` updates link URLs in memory. The callback receives each `Link` (its `file`, `position`, `type`, and `url`) and returns the new URL, or `undefined` to leave it unchanged. The new URL replaces the destination as written, so original escapes and character references are not preserved. For a non-mutating operation, `rewriteLinks(file, callback)` returns the rewritten string instead. `readLinks(file)` reads the current links without rewriting them.

`file.format(formatter)` accepts a synchronous or asynchronous formatter, keeping formatter dependencies and configuration with the caller. For example, with the workspace's Oxfmt dependency:

```ts
import { format } from "oxfmt";

await file.format(async (markdown, path) => {
    const result = await format(path, markdown, { useTabs: false });
    if (result.errors.length > 0) {
        throw new Error(result.errors.map((error) => error.message).join("\n"));
    }
    return result.code;
});
await file.write("dist/docs/intro.mdx");
```

`file.markdown` exposes the current content. `file.write(destination)` creates parent directories and writes that content; omitting the destination overwrites the source. Writing elsewhere does not change `file.path`, so relative links and diagnostics remain based on the source location. Copy non-Markdown assets separately when packaging documentation.

## Extending

Discovery produces a model independent of ts-morph. To add a format, implement a generator, add it to `DocumentationFormat`, and register it in [generate-markdown.ts](./src/docs-generators/generate-markdown.ts).
