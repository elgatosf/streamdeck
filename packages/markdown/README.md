<div align="center">

# @elgato/markdown

Tools for working with Markdown files.

[Elgato homepage](https://elgato.com)

</div>

`@elgato/markdown` is a private package for use within the Elgato workspace. It currently provides type checking for TypeScript code blocks in Markdown and MDX files.

## Features

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

### Link Checking

Finds Markdown files and checks their links. Relative links must resolve to a file, and when they target an anchor, the anchor must exist within that file: a heading (by slug or custom `{#id}`), a JSX element's `id`, or either of those within an MDX file imported as a partial. HTTP(S) links are requested, and must not respond with an error status.

```ts
import { checkLinks } from "@elgato/markdown";

const problems = await checkLinks({
    ignore: ["https://www.npmjs.com/"],
    src: "docs/**/*.md",
});

for (const problem of problems) {
    console.log(`${problem.link}: ${problem.url}: ${problem.message}`);
}
```

| Option     | Description                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------- |
| `src`      | Required glob pattern for the Markdown files to check.                                       |
| `cwd`      | Directory used to resolve the glob. Defaults to `process.cwd()`.                             |
| `external` | Whether HTTP(S) links are requested. Defaults to `true`.                                     |
| `ignore`   | Prefixes of HTTP(S) links that are not requested, e.g. sites that reject automated requests. |

Each `LinkProblem` includes the `file`, `line`, `column`, and `link` of the link, its `url`, and a `message` describing the problem.

### Link Rewriting

Rewrites the URLs of a file's links, for example to replace relative links with absolute ones when copying documentation elsewhere. The file is not modified.

```ts
import { rewriteLinks } from "@elgato/markdown";

const markdown = await rewriteLinks("docs/intro.md", (link) => {
    return link.url.startsWith("../cli/") ? `https://example.com/${link.url.slice(3)}` : undefined;
});
```

The callback receives each `Link` (its `file`, `position`, `type`, and `url`) and returns the new URL, or `undefined` to leave the link as is.
