<div align="center">

# @elgato/tsconfig

[TypeScript](https://www.typescriptlang.org/tsconfig/) configurations used by Elgato projects.

[![@elgato/tsconfig npm package](https://img.shields.io/npm/v/%40elgato/tsconfig?logo=npm&logoColor=white)](https://www.npmjs.com/package/@elgato/tsconfig)
[![Join the Marketplace Makers Discord](https://img.shields.io/badge/Marketplace%20Makers-5662f6?labelColor=grey&logo=discord&logoColor=white)](https://discord.gg/GehBUcu627)
[![Elgato homepage](https://img.shields.io/badge/Elgato-3431cf?labelColor=grey&logo=elgato)](https://elgato.com)

</div>

## Usage

1. Install `@elgato/tsconfig`.

```
pnpm add -D @elgato/tsconfig
```

2. Extend your `tsconfig.json` from one of the [available configurations](#available-configurations).

```jsonc
{
    "extends": "@elgato/tsconfig/node24/lib",
    "compilerOptions": {
        // Your config
    },
}
```

## Configurations

All configurations extend the following base:

```jsonc
{
    "compilerOptions": {
        /* Type checking */
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "noImplicitOverride": true,

        /* Modules */
        "module": "nodenext",
        "resolveJsonModule": true,

        /* JavaScript support */
        "allowJs": true,

        /* Interop constraints */
        "esModuleInterop": true,
        "isolatedModules": true,
        "verbatimModuleSyntax": true,

        /* Completeness */
        "skipLibCheck": true,
    },
}
```

### Available Configurations

- [DOM](#dom)
    - [App](#dom-app)
    - [Library](#dom-lib)
- [Node.js](#node)
    - [v20](#node20)
        - [Library](#node20-lib)
    - [v24](#node24)
        - [Library](#node24-lib)
    - [v26](#node26)
        - [Library](#node26-lib)
- [Isomorphic](#isomorphic)
    - [App](#isomorphic-app)
    - [Bundled](#isomorphic-bundled)
    - [Lib](#isomorphic-lib)

<h2 id="dom">DOM</h2>

<h3 id="dom-app">App</h3>

```jsonc
"extends": "@elgato/tsconfig/dom/app"
```

[`tsconfig.json`](./dom/tsconfig.app.json)

<h3 id="dom-lib">Library</h3>

```jsonc
"extends": "@elgato/tsconfig/dom/lib"
```

[`tsconfig.json`](./dom/tsconfig.lib.json)

<h2 id="node">Node.js</h2>

Node.js configurations require `@types/node`.

<h3 id="node20">v20.x</h3>

```bash
pnpm add -D @types/node@^20
```

<h4 id="node20-lib">Library</h4>

```jsonc
"extends": "@elgato/tsconfig/node20/lib"
```

[`tsconfig.json`](./node/20/tsconfig.lib.json)

<h3 id="node24">v24.x</h3>

```bash
pnpm add -D @types/node@^24
```

<h4 id="node24-lib">Library</h4>

```jsonc
"extends": "@elgato/tsconfig/node24/lib"
```

[`tsconfig.json`](./node/24/tsconfig.lib.json)

<h3 id="node26">v26</h3>

```bash
pnpm add -D @types/node@^26
```

<h4 id="node26-lib">Library</h4>

```jsonc
"extends": "@elgato/tsconfig/node26/lib"
```

[`tsconfig.json`](./node/26/tsconfig.lib.json)

## Isomorphic

Isomorphic configurations are compatible with both DOM and Node.js environments.

<h3 id="isomorphic-app">App</h3>

```jsonc
"extends": "@elgato/tsconfig/app"
```

[`tsconfig.json`](./isomorphic/tsconfig.app.json)

<h3 id="isomorphic-bundled">Bundled</h3>

```jsonc
"extends": "@elgato/tsconfig/bundled"
```

[`tsconfig.json`](./isomorphic/tsconfig.bundled.json)

<h3 id="isomorphic-lib">Library</h3>

```jsonc
"extends": "@elgato/tsconfig/lib"
```

[`tsconfig.json`](./isomorphic/tsconfig.lib.json)
