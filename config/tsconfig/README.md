<div align="center">

# @elgato/tsconfig

[TypeScript](https://www.typescriptlang.org/tsconfig/) configurations used by Elgato projects.

[![@elgato/tsconfig npm package](https://img.shields.io/npm/v/%40elgato/tsconfig?logo=npm&logoColor=white)](https://www.npmjs.com/package/@elgato/tsconfig)
[![Join the Marketplace Makers Discord](https://img.shields.io/badge/Marketplace%20Makers-5662f6?labelColor=grey&logo=discord&logoColor=white)](https://discord.gg/GehBUcu627)
[![Elgato homepage](https://img.shields.io/badge/Elgato-3431cf?labelColor=grey&logo=elgato)](https://elgato.com)

</div>

## Usage

1. Install `@elgato/tsconfig`.

```sh
pnpm add -D @elgato/tsconfig
```

2. Extend your `tsconfig.json` from one of the [supported configurations](#supported-configurations).

```jsonc
{
    "extends": "@elgato/tsconfig/node24/lib",
    "compilerOptions": {
        // Your config
    },
}
```

## Supported Configurations

Available TypeScript configurations are determined by two factors:

- Environment — where the code will run, e.g. a browser or Node.js.
- Build output — what the output of the code is.

These factors are available in the following combinations:

|              | `app` | `lib` | `monorepo/lib` |
| ------------ | ----- | ----- | -------------- |
| `dom`        | ✅    | ✅    | ✅             |
| `isomorphic` | ❌    | ✅    | ✅             |
| `node20`     | ✅    | ✅    | ✅             |
| `node24`     | ✅    | ✅    | ✅             |
| `node26`     | ✅    | ✅    | ✅             |

<h3 id="dom">DOM</h3>

Your code runs in a DOM-based environment, such as a browser or QtWebEngine.

```jsonc
{
    "extends": "@elgato/tsconfig/dom/app", // For a bundled app
    "extends": "@elgato/tsconfig/dom/lib", // For a library
    "extends": "@elgato/tsconfig/dom/monorepo/lib", // For a library in a monorepo
}
```

<h3 id="isomorphic">Isomorphic</h3>

Your code runs in a DOM and Node.js environment:

```sh
pnpm add -D @types/node@^24
```

```jsonc
{
    "extends": "@elgato/tsconfig/isomorphic/lib", // For a library
    "extends": "@elgato/tsconfig/isomorphic/monorepo/lib", // For a library in a monorepo
}
```

<h3 id="node20">Node.js 20</h3>

Your code runs in a Node.js 20 or higher environment:

```sh
pnpm add -D @types/node@^20
```

```jsonc
{
    "extends": "@elgato/tsconfig/node20/app", // For a bundled app
    "extends": "@elgato/tsconfig/node20/lib", // For a library
    "extends": "@elgato/tsconfig/node20/monorepo/lib", // For a library in a monorepo
}
```

<h3 id="node24">Node.js 24</h3>

Your code runs in a Node.js 24 or higher environment:

```sh
pnpm add -D @types/node@^24
```

```jsonc
{
    "extends": "@elgato/tsconfig/node24/app", // For a bundled app
    "extends": "@elgato/tsconfig/node24/lib", // For a library
    "extends": "@elgato/tsconfig/node24/monorepo/lib", // For a library in a monorepo
}
```

<h3 id="node26">Node.js 26</h3>

Your code runs in a Node.js 26 or higher environment:

```sh
pnpm add -D @types/node@^26
```

```jsonc
{
    "extends": "@elgato/tsconfig/node26/app", // For a bundled app
    "extends": "@elgato/tsconfig/node26/lib", // For a library
    "extends": "@elgato/tsconfig/node26/monorepo/lib", // For a library in a monorepo
}
```

Requires TypeScript 6.0 or higher for `ESNext.Temporal`.

## Configuration Differences

Each configuration provides access to different libraries based on the environment, and different outputs based on the build output. The following is a summary of those differences.

### Environments

- `dom` — code with access to a DOM, such as browsers.
- `node20`, `node24`, `node26` — code with access to Node.js.
- `isomorphic` — code intended for DOM and Node.js environments.

|              | `lib`                                        | `target` | `types` |
| ------------ | -------------------------------------------- | -------- | ------- |
| `dom`        | `es2022`, `dom`, `dom.iterable`              | `es2022` | -       |
| `isomorphic` | `es2022`                                     | `es2022` | `node`  |
| `node20`     | See [`@tsconfig/node20`][node20]             | `es2022` | `node`  |
| `node24`     | See [`@tsconfig/node24`][node24]             | `es2024` | `node`  |
| `node26`     | See [`@tsconfig/node26`][node26]<sup>1</sup> | `es2025` | `node`  |

<sup>1</sup> Requires TypeScript 6.0 or higher for `ESNext.Temporal`.

[node20]: https://www.npmjs.com/package/@tsconfig/node20
[node24]: https://www.npmjs.com/package/@tsconfig/node24
[node26]: https://www.npmjs.com/package/@tsconfig/node26

### Build Output

- `app` — a self-contained output built using a bundler, such as [`rolldown`](https://rolldown.rs/).
- `lib` — an unbundled output built using TypeScript, intended to be referenced by another package.
- `monorepo/lib` — an extension of `lib`, when the code is in a monorepo project.

|                   |   `app`    |   `lib`    |       `monorepo/lib`        |
| ----------------- | :--------: | :--------: | :-------------------------: |
| `module`          | `preserve` | `nodenext` |         `nodenext`          |
| `composite`       |     ❌     |     ❌     |             ✅              |
| `tsBuildInfoFile` |     -      |     -      | `dist/tsconfig.tsbuildinfo` |
| `declaration`     |     ❌     |     ✅     |             ✅              |
| `declarationMap`  |     ❌     |     ❌     |             ✅              |
| `outDir`          |     -      |   `dist`   |           `dist`            |
| `noEmit`          |     ✅     |     ❌     |             ❌              |
| `rootDir`         |   `src`    |   `src`    |            `src`            |
| `sourceMap`       |     ❌     |     ✅     |             ✅              |
| `include`         | `["src"]`  | `["src"]`  |          `["src"]`          |

## Assumptions

### `outDir`

When building with TypeScript, the output directory is `dist`.

```jsonc
{
    "extends": "@elgato/tsconfig/dom/lib",
    "compilerOptions": {
        "outDir": "dist", // Change to override
    },
}
```

Applies to:

- `@elgato/tsconfig/dom/lib`
- `@elgato/tsconfig/dom/monorepo/lib`
- `@elgato/tsconfig/isomorphic/lib`
- `@elgato/tsconfig/isomorphic/monorepo/lib`
- `@elgato/tsconfig/node20/lib`
- `@elgato/tsconfig/node20/monorepo/lib`
- `@elgato/tsconfig/node24/lib`
- `@elgato/tsconfig/node24/monorepo/lib`
- `@elgato/tsconfig/node26/lib`
- `@elgato/tsconfig/node26/monorepo/lib`

### `rootDir`

The root directory is `src`.

```jsonc
{
    "extends": "@elgato/tsconfig/dom/lib",
    "compilerOptions": {
        "rootDir": "src", // Change to override
    },
}
```

Applies to:

- All configurations

### `tsBuildInfoFile`

When developing in a monorepo, the `.tsbuildinfo` file is saved to `dist/tsconfig.tsbuildinfo`.

```jsonc
{
    "extends": "@elgato/tsconfig/node24/monorepo/lib",
    "compilerOptions": {
        "tsBuildInfoFile": "dist/tsconfig.tsbuildinfo", // Change to override
    },
}
```

- `@elgato/tsconfig/dom/monorepo/lib`
- `@elgato/tsconfig/isomorphic/monorepo/lib`
- `@elgato/tsconfig/node20/monorepo/lib`
- `@elgato/tsconfig/node24/monorepo/lib`
- `@elgato/tsconfig/node26/monorepo/lib`

### `include`

The included files are `["src"]`.

```jsonc
{
    "extends": "@elgato/tsconfig/dom/monorepo/lib",
    "include": ["src"], // Change to override
}
```

Applies to:

- All configurations
