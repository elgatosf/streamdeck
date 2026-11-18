<div align="center">

# @elgato/markdown

Tools for working with Markdown files.

[Elgato homepage](https://elgato.com)

</div>

`@elgato/markdown` is a private workspace package for:

- Generating documentation from TypeScript types and JSDoc.
- Replacing named sections in Markdown files.
- Checking and rewriting links in Markdown and MDX.
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

## Check and rewrite Markdown

Read files once, then check and rewrite them in memory; nothing is written until `write` is called:

```ts
import { join, relative, resolve } from "node:path";

import { checkLinks, readMarkdownFiles, typeCheck } from "@elgato/markdown";

const src = resolve("docs");
const files = await readMarkdownFiles("**/*.{md,mdx}", src);

const problems = await checkLinks(files);
const diagnostics = typeCheck(files);

for (const file of files) {
    // Return the new URL, or undefined to leave the link unchanged.
    file.rewriteLinks((link) =>
        link.url.startsWith("../api/") ? `https://example.com/${link.url.slice(3)}` : undefined,
    );
    await file.write(join("dist", relative(src, file.path)));
}
```

- `readMarkdownFiles` throws if no files match, or an MDX file cannot be parsed.
- Problems and diagnostics include the Markdown file, 1-based line and column, a file URL, and a message.

### Type checking

| Option         | Description                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `codeBlockDir` | Directory used to resolve the tsconfig and imports; defaults to the current working directory. |
| `tsconfigFile` | Tsconfig path relative to `codeBlockDir`; defaults to `tsconfig.json`.                         |

- Checks fences labeled `ts`, `typescript`, `tsx`, `mts`, or `cts` (case-insensitive), including those inside MDX JSX; skips fences marked `nocheck`.
- Checks each block as a separate module in `codeBlockDir`; include required imports. If `rootDir` is restricted, set `codeBlockDir` inside it.

### Link checking

| Option     | Description                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------- |
| `external` | Whether HTTP(S) links are requested; defaults to `true`.                                     |
| `ignore`   | Prefixes of HTTP(S) links that are not requested, e.g. sites that reject automated requests. |

- Relative links must resolve to a file; anchors must match a heading slug, a custom `{#id}`, a JSX `id`, or one of those in an imported MDX partial.
- HTTP(S) links must not respond with an error status; `429` is tolerated, and loopback addresses are not requested.

## Extending

Discovery produces a model independent of ts-morph. To add a format, implement a generator, add it to `DocumentationFormat`, and register it in [generate-markdown.ts](./src/docs-generators/generate-markdown.ts).
