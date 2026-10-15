---
sidebar_position: 1
---

# Code Linting

Linting your code greatly improves consistency and readability. This leads to improved maintainability, and often reduces bugs caused to coding quirks. Whilst completely optional, it is encouraged to lint your code; to assist with this, Elgato provides pre-defined configurations that we use for our projects.

## Quick Start

Install the ESLint and Prettier configurations.

```bash
npm install @elgato/eslint-config @elgato/prettier-config --save-dev
```

Update your `package.json` file to include a `lint` script, and configure Prettier.

```json title="package.json"
{
	"scripts": {
		"lint": "eslint --max-warnings 0"
	},
	"prettier": "@elgato/prettier-config"
}
```

At the root of your project, download the [`.editorconfig`](https://raw.githubusercontent.com/elgatosf/prettier-config/main/.editorconfig) file to configure your IDE, and create a `eslint.config.js` file to configure ESLint.

```js title="eslint.config.js"

export default config.recommended;
```

## ESLint

[ESLint](https://eslint.org/) is a popular static code analysis tool for JavaScript and Typescript projects, allowing you to quickly identify and resolve problems. The ESLing configuration used within Elgato's project is available publicly, and can optionally be added to your projects.

### Installation {#eslint-installation}

Install `@elgato/eslint-config` as a `devDependency`.

```bash
npm install @elgato/eslint-config --save-dev
```

Create an `eslint.config.js` file at the root of your project.

```js title="eslint.config.js"

export default config.recommended;
```

There are two configurations available:

- Recommended — `config.recommended`
- Strict — `config.strict` (stricter type enforcing)

### Usage {#eslint-usage}

The [ESLint CLI](https://eslint.org/docs/latest/use/command-line-interface) provides an array of useful commands. These can optionally be added to your `package.json` `scripts` object to further streamline checking and formatting, for example.

<Tabs>
<TabItem value="NPM Script">

```jsonc title="package.json"
{
	"scripts": {
		"lint": "eslint --max-warnings 0"
	}
}
```

</TabItem>
<TabItem value="Terminal">

```bash
eslint --max-warnings 0
```

</TabItem>
</Tabs>

### Configuration {#eslint-configuration}

#### Extends {#eslint-configuration-extends}

- JSDoc recommended
- ESLint recommended
- TypeScript ESLint recommended

#### Rules {#eslint-rules}

| Rule                                       | Recommended  | Strict       | Notes                                                                 |
| ------------------------------------------ | ------------ | ------------ | --------------------------------------------------------------------- |
| Indent: Tabs                               | ⚠️&nbsp;Warn | ⚠️&nbsp;Warn |                                                                       |
| JSDoc: Check tag names                     | ⚠️&nbsp;Warn | ⚠️&nbsp;Warn | Additional tags: `csspart`, `cssproperty`, `jest-environment`, `slot` |
| JSDoc: No undefined types                  | ⚠️&nbsp;Warn | ⚠️&nbsp;Warn |                                                                       |
| JSDoc: Require JSDoc                       | ⚠️&nbsp;Warn | ⚠️&nbsp;Warn |                                                                       |
| JSDoc: Require Returns                     | ⚠️&nbsp;Warn | ⚠️&nbsp;Warn | Disabled for getters.                                                 |
| TypeScript: Explicit function return types | ✅ Off       | ⚠️&nbsp;Warn | Disabled for JavaScript, tests, and mock files.                       |
| TypeScript: Explicit member accessibility  | ⚠️&nbsp;Warn | ⚠️&nbsp;Warn | No `public` required `constructor`.                                   |
| TypeScript: Member ordering                | ⚠️&nbsp;Warn | ⚠️&nbsp;Warn | Grouped by type and then access, and ordered alphabetically.          |
| TypeScript: Sort type constituents         | ⚠️&nbsp;Warn | ⚠️&nbsp;Warn |                                                                       |

<details>
<summary>Member Ordering</summary>

Members of a class should be grouped by type and then by access, and ordered alphabetically. The ordering is as follows:

**Type Order**

- Fields
- Constructors
- Signatures / call signatures
- Properties (get / set)
- Methods

**Access Order**

- Public (static / abstract / regular)
- Protected (static / abstract / regular)
- Private (static / abstract / regular)

</details>

<details>
<summary>Ignored Files</summary>

By default, the following files are ignored:

- `.github/`
- `bin/`
- `dist/`
- `node_modules/`

</details>

### Overrides {#prettier-overrides}

Configuration settings can be overridden using the `defineConfig` helper function from ESLint, extending `@elgato/eslint-config`, and then defining your preferred settings.

```js title="eslint.config.js"

export default defineConfig([
	{
		extends: [config.recommended],

		// Anything from here will override @elgato/eslint-config
		rules: {
			"no-unused-vars": "warn",
		},
	},
]);
```

[Learn more](https://eslint.org/docs/latest/extend/shareable-configs#overriding-settings-from-shareable-configs) about overriding settings.

## Prettier

[Prettier](https://prettier.io) is a configurable "opinionated code formatter" that makes formatting code effortless. The Prettier configuration used within Elgato's projects is available publicly, and can optionally be added to your projects to improve readability and code consistency.

### Installation {#prettier-installation}

Install `@elgato/prettier-config` as a `devDependency`.

```bash
npm install @elgato/prettier-config --save-dev
```

Configure Prettier within your `package.json` to use the configuration.

```json title="package.json"
"prettier": "@elgato/prettier-config"
```

Add the accompanying `.editorconfig` file to the root of your project. [Download the `.editorconfig` file](https://raw.githubusercontent.com/elgatosf/prettier-config/main/.editorconfig).

### Usage {#prettier-usage}

The [Prettier CLI](https://prettier.io/docs/en/cli) provides an array of useful commands. These can optionally be added to your `package.json` `scripts` object to further streamline checking and formatting, for example.

#### Check Files

<Tabs>
<TabItem value="NPM Script">

```jsonc title="package.json"
{
	"scripts": {
		"lint": "prettier . --check",
	}
}
```

</TabItem>
<TabItem value="Terminal">

```bash
prettier . --check
```

</TabItem>
</Tabs>

#### Format Files

<Tabs>
<TabItem value="NPM Script">

```jsonc title="package.json"
{
	"scripts": {
		"lint:fix": "prettier . --write",
	}
}
```

</TabItem>
<TabItem value="Terminal">

```bash
prettier . --write
```

</TabItem>
</Tabs>

> [!TIP]
> **Format on save**
>
> Prettier provides a [VS Code extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to further streamline formatting your files. Once installed and configured, you can configure VS Code to format files when they're saved by setting `editor.formatOnSave` to `true` in your VS Code preferences.

### Configuration {#prettier-configuration}

| Option                                                                                                                                               | Value                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`endOfLine`](https://prettier.io/docs/en/options#end-of-line)                                                                                       | `lf`                                                |
| [`printWidth`](https://prettier.io/docs/en/options#print-width)                                                                                      | 120                                                 |
| [`singleQuote`](https://prettier.io/docs/en/options#quotes)                                                                                          | ❌ Prefer double                                    |
| [`semi`](https://prettier.io/docs/en/options#semicolons)                                                                                             | ✅ Prefer semicolons                                |
| [`tabWidth`](https://prettier.io/docs/en/options#tab-width)                                                                                          | 4 spaces (2 spaces for `.yaml`, `.yml`)             |
| [`useTabs`](https://prettier.io/docs/en/options#tabs)                                                                                                | ✅ Except `.json`, `.jsonc`, `.md`, `.yaml`, `.yml` |
| [`trailingComma`](https://prettier.io/docs/en/options#trailing-commas)                                                                               | All, except `.jsonc`                                |
| [`multilineArraysWrapThreshold`](https://github.com/electrovir/prettier-plugin-multiline-arrays?tab=readme-ov-file#options) (multiline-arrays)       | -1 (manual)                                         |
| [`importOrder`](https://github.com/trivago/prettier-plugin-sort-imports?tab=readme-ov-file#importorder) (sort-imports)                               | Third-party modules first                           |
| [`importOrderSeparation`](https://github.com/trivago/prettier-plugin-sort-imports?tab=readme-ov-file#importorderseparation) (sort-imports)           | ✅                                                  |
| [`importOrderSortSpecifiers`](https://github.com/trivago/prettier-plugin-sort-imports?tab=readme-ov-file#importordersortspecifiers) (sort-imports)   | ✅                                                  |
| [`importOrderCaseInsensitive`](https://github.com/trivago/prettier-plugin-sort-imports?tab=readme-ov-file#importordercaseinsensitive) (sort-imports) | ✅                                                  |
| [`importOrderParserPlugins`](https://github.com/trivago/prettier-plugin-sort-imports?tab=readme-ov-file#importorderparserplugins) (sort-imports)     | TypeScript                                          |

### Overrides {#prettier-overrides}

Overriding configuration can be achieved by removing the `prettier` entry from your `package.json`, and instead using a [.prettierrc.js](https://prettier.io/docs/en/configuration) file. For example, to prefer spaces over tabs:

```js title=".prettierrc.js"
module.exports = {
	...require("@elgato/prettier-config"),
	tabWidth: 2,
	useTabs: false,
};
```
