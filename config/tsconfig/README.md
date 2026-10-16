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

[`tsconfig.json`](./tsconfig.json)

### Available Configurations

- [DOM](#dom)
    - [Bundle](#dom-bundle)
    - [Library](#dom-lib)
- [Isomorphic](#isomorphic)
    - [Library](#isomorphic-lib)
- [Node.js ≥24](#node24)
    - [Library](#node24-lib)
    - [Stream Deck Plugin](#node24-plugin)
- [Node.js ≥26](#node26)
    - [Library](#node26-lib)
    - [Stream Deck Plugin](#node26-plugin)

<h2 id="dom">DOM</h2>

All DOM configurations include:

```jsonc
{
    "extends": "<base>",
    "compilerOptions": {
        /* Language and environment */
        "target": "es2022",
        "lib": ["es2022", "dom", "dom.iterable"],
    },
}
```

[`tsconfig.json`](./dom/tsconfig.dom.json)

<h3 id="dom-bundle">Bundle</h3>

Usage:

```jsonc
"extends": "@elgato/tsconfig/dom/bundle"
```

Configuration:

```jsonc
{
    "extends": "<DOM base>",
    "compilerOptions": {
        /* Modules */
        "module": "preserve",

        /* Emit */
        "declaration": true,
        "noEmit": true,
        "sourceMap": true,
    },
}
```

[`tsconfig.json`](./dom/tsconfig.bundle.json)

<h3 id="dom-lib">Library</h3>

Usage:

```jsonc
"extends": "@elgato/tsconfig/dom/lib"
```

Configuration:

```jsonc
{
    "extends": "<DOM base>",
    "compilerOptions": {
        /* Emit */
        "declaration": true,
        "sourceMap": true,
    },
}
```

[`tsconfig.json`](./dom/tsconfig.lib.json)

<h2 id="isomorphic">Isomorphic</h2>

Isomorphic configurations are compatible with both DOM and Node.js environments, and require `@types/node`.

```bash
pnpm add -D @types/node@^24
```

All isomorphic configurations include:

```jsonc
{
    "extends": "<base>",
    "compilerOptions": {
        /* Language and environment */
        "target": "es2022",
        "lib": ["es2022", "esnext.disposable"],

        /* Modules */
        "types": ["node"],
    },
}
```

[`tsconfig.json`](./isomorphic/tsconfig.isomorphic.json)

<h3 id="isomorphic-lib">Library</h3>

Usage:

```jsonc
"extends": "@elgato/tsconfig/isomorphic/lib"
```

Configuration:

```jsonc
{
    "extends": "<isomorphic base>",
    "compilerOptions": {
        /* Emit */
        "declaration": true,
        "sourceMap": true,
    },
}
```

[`tsconfig.json`](./isomorphic/tsconfig.lib.json)

<h2 id="node24">Node.js ≥24</h2>

Requires `@types/node`.

```bash
pnpm add -D @types/node@^24
```

All Node.js ≥24 configurations include:

```jsonc
{
    "extends": "<base>",
    "compilerOptions": {
        /* Language and environment */
        "lib": ["es2024", "ESNext.Array", "ESNext.Collection", "ESNext.Error", "ESNext.Iterator", "ESNext.Promise"],
        "target": "es2024",

        /* Modules */
        "types": ["node"],
    },
}
```

[`tsconfig.json`](./node/24/tsconfig.node24.json)

<h3 id="node24-lib">Library</h3>

Usage:

```jsonc
"extends": "@elgato/tsconfig/node24/lib"
```

Configuration:

```jsonc
{
    "extends": "<Node.js ≥24 base>",
    "compilerOptions": {
        /* Emit */
        "declaration": true,
        "sourceMap": true,
    },
}
```

[`tsconfig.json`](./node/24/tsconfig.lib.json)

<h3 id="node24-plugin">Stream Deck Plugin</h3>

Usage:

```jsonc
"extends": "@elgato/tsconfig/node24/streamdeck/plugin"
```

Configuration:

```jsonc
{
    "extends": "<Node.js ≥24 base>",
    "compilerOptions": {
        /* Modules */
        "module": "preserve",

        /* Emit */
        "declaration": false,
        "noEmit": true,
        "sourceMap": true,
    },
}
```

[`tsconfig.json`](./node/24/tsconfig.plugin.json)

<h2 id="node26">Node.js ≥26</h2>

Requires `@types/node`.

```bash
pnpm add -D @types/node@^26
```

All Node.js ≥26 configurations include:

```jsonc
{
    "extends": "<base>",
    "compilerOptions": {
        /* Language and environment */
        "lib": ["es2025", "ESNext.Collection", "ESNext.Temporal"],
        "target": "es2025",

        /* Modules */
        "types": ["node"],
    },
}
```

[`tsconfig.json`](./node/26/tsconfig.node26.json)

<h3 id="node26-lib">Library</h3>

Usage:

```jsonc
"extends": "@elgato/tsconfig/node26/lib"
```

Configuration:

```jsonc
{
    "extends": "<Node.js ≥26 base>",
    "compilerOptions": {
        /* Emit */
        "declaration": true,
        "sourceMap": true,
    },
}
```

[`tsconfig.json`](./node/26/tsconfig.lib.json)

<h3 id="node26-plugin">Stream Deck Plugin</h3>

Usage:

```jsonc
"extends": "@elgato/tsconfig/node26/streamdeck/plugin"
```

Configuration:

```jsonc
{
    "extends": "<Node.js ≥26 base>",
    "compilerOptions": {
        /* Modules */
        "module": "preserve",

        /* Emit */
        "declaration": false,
        "noEmit": true,
        "sourceMap": true,
    },
}
```

[`tsconfig.json`](./node/26/tsconfig.plugin.json)
