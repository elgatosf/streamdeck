<div align="center">

# @elgato/markdown

Tools for working with Markdown files.

[Elgato homepage](https://elgato.com)

</div>

`@elgato/markdown` is a private package for use within the Elgato workspace. It provides type checking for TypeScript code blocks in Markdown and MDX files, generates Markdown documentation from TypeScript types, and formats sections of Markdown files.

## Features

### Docs

Generates Markdown documentation for a TypeScript type and the types it references, using their JSDoc. Referenced enums, interfaces, and type aliases are discovered transitively; computed types are resolved, intersections are flattened, and inherited generic properties are instantiated.

```ts
import { writeFileSync } from "node:fs";

import { createDocumentationSource } from "@elgato/markdown";

const source = createDocumentationSource({
    src: "src/index.ts",
    tsconfigFile: "tsconfig.json",
});

const markdown = await source.generate({ typeName: "Manifest", format: "flat" });
writeFileSync("manifest.md", markdown);
```

`createDocumentationSource` accepts the `src`, `tsconfigFile`, and `tags` options. `src` is the required path to a TypeScript file declaring or re-exporting the types; paths are resolved relative to the current working directory. The optional `tsconfigFile` selects compiler settings used to resolve referenced types, and `tags` selects the JSDoc tags to include (without the `@` prefix). When no tsconfig is supplied, strict compiler options are used.

```ts
const manifest = await source.generate({ typeName: "Manifest", format: "flat" });
const manifestTable = await source.generate({ typeName: "Manifest", format: "table" });
const layout = await source.generate({ typeName: "Layout", format: "flat", headingOffset: 1 });
```

`generate` accepts the required `typeName` and `format` options, plus optional `overview` and `headingOffset`. The format is `flat` for property headings or `table` for property tables. Each type is discovered once per source, so different formats can reuse the same model. Creating a source throws if a file cannot be read; `generate` returns a promise that rejects if the type is missing, the format is unsupported, a code block cannot be formatted, or the heading offset is invalid or pushes a heading beyond level 6.

The root type, and each referenced object type, is rendered with an overview of its definition. Overviews are `collapsed` by default, referencing other types by name, e.g. `Actions: Action[];`. When `expanded`, referenced object types, including those within arrays, tuples, and unions, are inlined as nested structures, and generic types are instantiated with their type arguments; enums, unions of literals, and recursive references are still referenced by name.

```ts
const manifest = await source.generate({ typeName: "Manifest", format: "flat", overview: "expanded" });
const layout = await source.generate({ typeName: "Layout", format: "table", overview: "expanded" });
```

Generated TypeScript code blocks are formatted with oxfmt using the shared Markdown formatting configuration. Property and enum member snippets are formatted in their respective TypeScript contexts.

<!-- Dotted paths keep inline members identifiable without turning anonymous object types into separate chapters. -->
Properties of inline object types, e.g. `font: { size: number }`, are documented alongside the type's own properties using their path, e.g. `font.size`; inline objects within arrays, tuples, and unions are included. In the flat format, each nested property links to the property it belongs to.

The flat format uses three heading levels, and the table format two, so the maximum `headingOffset` is `3` and `4` respectively.

Headings have explicit, unique lowercase IDs, e.g. ``# `Manifest` {#manifest}`` and ``### `Actions` {#manifest-actions}``. Names are separated by hyphens and duplicate IDs receive numeric suffixes. Table rows use HTML anchors with the same ID format.

The `{#id}` heading syntax requires a renderer that supports explicit heading IDs, such as Docusaurus for Markdown or Astro with a heading-ID remark plugin. It is not supported by all Markdown renderers, and MDX requires additional compatibility configuration.

Only the `@default`, `@defaultValue`, `@deprecated`, `@remarks`, `@see`, and `@since` tags are included by default; use the `tags` option to change them.

Internally, discovery produces a model that is independent of ts-morph, and each generator renders that model. New formats can be added by implementing a generator, adding the format to `DocumentationFormat`, and registering it with the generators in `generate-markdown.ts`.

### Format

Replaces the content of sections within a Markdown file. Sections start with `<!-- format:start {id} -->`, and end with `<!-- format:end {id} -->`.

```md
# Manifest

<!-- format:start manifest -->

This content is replaced.

<!-- format:end manifest -->
```

```ts
import { writeFileSync } from "node:fs";

import { format } from "@elgato/markdown";

const markdown = format({
    target: "README.md",
    data: { manifest: "## Properties" },
});

writeFileSync("README.md", markdown);
```

| Option   | Description                                                                                |
| -------- | ------------------------------------------------------------------------------------------ |
| `target` | Required path to the Markdown file, resolved relative to the current working directory.    |
| `data`   | Required content of each section, keyed by the section's identifier, as a `Map` or object. |

`format` returns the Markdown without writing a file. Markers are kept, and content is separated from them by blank lines, so a file can be formatted repeatedly. Sections without data are left unchanged, and multiple sections can share an identifier. Only top-level markers are recognized, so markers within code blocks, lists, block quotes, or paragraphs are ignored. It throws if the file cannot be read, a marker is unmatched, sections are nested, or `data` contains an identifier without a section.
<!-- Top-level-only markers avoid treating examples and quoted Markdown as instructions to rewrite content. -->

### Type Checking

Finds Markdown files, checks their fenced TypeScript code blocks using a `tsconfig`, and returns diagnostics with positions linked to the source files.

```ts
import { typeCheck } from "@elgato/markdown";

const diagnostics = await typeCheck({
    cwd: process.cwd(),
    src: "docs/**/*.md",
    tsconfigFile: "tsconfig.json",
});

for (const diagnostic of diagnostics) {
    console.log(`${diagnostic.link}: TS${diagnostic.code} ${diagnostic.message}`);
}
```

`cwd` defaults to the current working directory, and `tsconfigFile` defaults to `tsconfig.json`. Both the source pattern and tsconfig path are resolved relative to `cwd`.

#### Type-Checked Code Blocks

Fenced code blocks labeled `ts`, `typescript`, `tsx`, `mts`, or `cts` are type-checked; language labels are case-insensitive. JavaScript, unlabeled, and indented code blocks are ignored. Markdown files with an `.mdx` extension are parsed as MDX, including code blocks inside JSX elements.

Each block is checked as a separate module. Imports are resolved from `cwd` using the compiler options in the specified tsconfig.

#### Options

| Option         | Description                                                                                |
| -------------- | ------------------------------------------------------------------------------------------ |
| `src`          | Required glob pattern for the Markdown files to check, e.g. `README.md` or `docs/**/*.md`. |
| `cwd`          | Directory used to resolve the glob, tsconfig, and imports. Defaults to `process.cwd()`.    |
| `tsconfigFile` | Tsconfig path relative to `cwd`. Defaults to `tsconfig.json`.                              |

#### Diagnostics

`typeCheck` returns an array of `CodeBlockDiagnostic` objects. Each diagnostic includes:

- `category` and `code` from TypeScript.
- `file`, the absolute path of the Markdown file.
- `line` and `column`, 1-based positions within that file.
- `link`, a file URL with the diagnostic position.
- `message`, the TypeScript diagnostic message.

The function throws if the tsconfig cannot be read or is invalid, if no Markdown files match `src`, or if an MDX file cannot be parsed.
