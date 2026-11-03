<div align="center">

# @elgato/markdown

Tools for working with Markdown files.

[Elgato homepage](https://elgato.com)

</div>

`@elgato/markdown` is a private package for use within the Elgato workspace. It provides type checking for TypeScript code blocks in Markdown and MDX files, and generates Markdown documentation from TypeScript types.

## Features

### Docs

Generates Markdown documentation for a TypeScript type and the types it references, using their JSDoc. Referenced enums, interfaces, and type aliases are discovered transitively; computed types are resolved, intersections are flattened, and inherited generic properties are instantiated.

```ts
import { writeFileSync } from "node:fs";

import { generateMarkdown } from "@elgato/markdown";

const markdown = generateMarkdown({
    src: "src/manifest.ts",
    typeName: "Manifest",
    format: "flat",
    tsconfigFile: "tsconfig.json",
});

writeFileSync("manifest.md", markdown);
```

| Option         | Description                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `src`          | Required path to the TypeScript file declaring the type.                                           |
| `typeName`     | Required name of the type to document.                                                             |
| `format`       | Required output format: `flat` for property headings, or `table` for property tables.              |
| `tsconfigFile` | Optional path to the tsconfig used to resolve types. If omitted, strict compiler options are used. |
| `tags`         | Optional iterable of JSDoc tag names to include, without the `@` prefix.                           |

Paths are resolved relative to the current working directory. `generateMarkdown` returns the Markdown without writing a file. It throws if a file cannot be read, the type is not found, or the format is unsupported. The type can be declared in `src`, or re-exported by it, e.g. from an `index.ts`.

To document multiple types, or formats, from the same file, use `createDocumentationSource`; the file is loaded once, and each type is discovered once.

```ts
import { createDocumentationSource } from "@elgato/markdown";

const source = createDocumentationSource({ src: "src/index.ts", tsconfigFile: "tsconfig.json" });

const manifest = source.generate("Manifest", "flat");
const manifestTable = source.generate("Manifest", "table");
const layout = source.generate("Layout", "flat");
```

`createDocumentationSource` accepts the `src`, `tsconfigFile`, and `tags` options, and throws if a file cannot be read; `generate` throws if the type is not found, or the format is unsupported.

Every heading has a unique anchor, `{type}` or `{type}.{property}`. Only the `@default`, `@defaultValue`, `@deprecated`, `@remarks`, `@see`, and `@since` tags are included by default; use the `tags` option to change them.

Internally, discovery produces a model that is independent of ts-morph, and each generator renders that model. New formats can be added by implementing a generator, adding the format to `DocumentationFormat`, and registering it with the generators in `generate-markdown.ts`.

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
