<div align="center">

[![Stream Deck SDK banner](https://images.ctfassets.net/8j9xr8kwdre8/1ihLKCwNWEfPixs27dq0c0/130be66a5173f332e4caa892a3462893/banner.png)](https://docs.elgato.com/sdk)

# Schemas

[![Schemas npm package](https://img.shields.io/npm/v/%40elgato/schemas?logo=npm&logoColor=white)](https://www.npmjs.com/package/@elgato/schemas)
[![SDK documentation](https://img.shields.io/badge/Documentation-2ea043?labelColor=grey&logo=gitbook&logoColor=white)](https://docs.elgato.com/sdk)
[![Join the Marketplace Makers Discord](https://img.shields.io/badge/Marketplace%20Makers-5662f6?labelColor=grey&logo=discord&logoColor=white)](https://discord.gg/GehBUcu627)
[![Elgato homepage](https://img.shields.io/badge/Elgato-3431cf?labelColor=grey&logo=elgato)](https://elgato.com)

</div>

Collection of schemas, and TypeScript declarations, to support the creation and validation of Stream Deck SDK files.

```bash
npm install @elgato/schemas
```

## Stream Deck

### Plugin

#### Manifest

Manifest JSON file responsible for defining a Stream Deck plugin.

```ts
// TypeScript type.
import { type Manifest } from "@elgato/schemas/streamdeck/plugins";
```

```js
// Schema as an object.
import manifest from "@elgato/schemas/streamdeck/plugins/json";
```

```js
// Schema as an object, with experimental import attributes
import manifest from "@elgato/schemas/streamdeck/plugins/manifest.json" with { type: "json" };
```

```
https://schemas.elgato.com/streamdeck/plugins/manifest.json
```

#### Layout

Layout JSON file that defines the layout of an action on Stream Deck +.

```ts
// TypeScript type.
import { type Layout } from "@elgato/schemas/streamdeck/plugins";
```

```js
// Schema as an object.
import layout from "@elgato/schemas/streamdeck/plugins/json";
```

```js
// Schema as an object, with experimental import attributes
import layout from "@elgato/schemas/streamdeck/plugins/layout.json" with { type: "json" };
```

```
https://schemas.elgato.com/streamdeck/plugins/layout.json
```

## Usage

Schemas can be referenced directly within JSON files, providing intellisense and validation, using the `$schema` property, for example:

```jsonc
{
    "$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json",
    "Name": "Wave Link",
    "Version": "1.9.0.0",
    "Author": "Elgato"
    // ...
}
```

## Keywords

Custom keywords used within the provided schemas can also be directly imported to assist with constructing a validator, such as `Ajv`. Please note, the custom keyword definitions will only register the keyword, and will not provide validation.

```ts
import { keywordDefinitions } from "@elgato/schemas";
import Ajv from "ajv";

// add the "filePath" keyword (excluding validation)
ajv.addKeyword(keywordDefinitions.filePath);
```
