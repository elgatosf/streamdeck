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
