<div align="center">

# @elgato/oxfmt-config

[Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) configuration used by Elgato projects.

[![@elgato/oxfmt-config npm package](https://img.shields.io/npm/v/%40elgato/oxfmt-config?logo=npm&logoColor=white)](https://www.npmjs.com/package/@elgato/oxfmt-config)
[![Join the Marketplace Makers Discord](https://img.shields.io/badge/Marketplace%20Makers-5662f6?labelColor=grey&logo=discord&logoColor=white)](https://discord.gg/GehBUcu627)
[![Elgato homepage](https://img.shields.io/badge/Elgato-3431cf?labelColor=grey&logo=elgato)](https://elgato.com)

</div>

## Usage

1. Install `@elgato/oxfmt-config`.

```
pnpm add- D oxfmt @elgato/oxfmt-config
```

2. Create an `oxfmt.config.mts` file at the root of your project.

```ts
import config from "@elgato/oxfmt-config";

export default config;
```

3. Add scripts to `package.json`.

```json
{
    "scripts": {
        "fmt": "oxfmt",
        "fmt:check": "oxfmt --check"
    }
}
```

## Configuration

### Main

| Option                                                                                                | Value                                               |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`endOfLine`](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#endofline)         | `lf`                                                |
| [`printWidth`](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#printwidth)       | 120                                                 |
| [`singleQuote`](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#singlequote)     | ❌ Prefer double                                    |
| [`semi`](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#semi)                   | ✅ Prefer semicolons                                |
| [`tabWidth`](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#tabwidth)           | 4 (2 for `.yaml`, `.yml`)                           |
| [`trailingComma`](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#trailingcomma) | All, except `.jsonc`                                |
| [`useTabs`](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#usetabs)             | ✅ Except `.json`, `.jsonc`, `.md`, `.yaml`, `.yml` |

### Sort Imports

| Option                                                                                                                | Value |
| --------------------------------------------------------------------------------------------------------------------- | ----- |
| [`newlinesBetween`](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#sortimports-newlinesbetween) | ✅    |

### Overrides

Overriding configuration can be achieved using the [`overrides`](https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html#overrides) configuration option.

For example, to prefer spaces over tabs:

```ts
import config from "@elgato/oxfmt-config";

config.overrides.push({
    files: ["*"],
    options: {
        tabWidth: 2,
        useTabs: false,
    },
});

export default config;
```
