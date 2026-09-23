<div align="center">

[![Stream Deck SDK banner](https://images.ctfassets.net/8j9xr8kwdre8/1ihLKCwNWEfPixs27dq0c0/130be66a5173f332e4caa892a3462893/banner.png)](https://docs.elgato.com/sdk)

# Schemas

[![Schemas npm package](https://img.shields.io/npm/v/%40elgato/schemas?logo=npm&logoColor=white)](https://www.npmjs.com/package/@elgato/schemas)
[![SDK documentation](https://img.shields.io/badge/Documentation-2ea043?labelColor=grey&logo=gitbook&logoColor=white)](https://docs.elgato.com/sdk)
[![Join the Marketplace Makers Discord](https://img.shields.io/badge/Marketplace%20Makers-5662f6?labelColor=grey&logo=discord&logoColor=white)](https://discord.gg/GehBUcu627)
[![Elgato homepage](https://img.shields.io/badge/Elgato-3431cf?labelColor=grey&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RWxnYXRvPC90aXRsZT48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJtMTMuODgxOCA4LjM5NjQuMDI2MS4wMTk2IDkuOTQ5NCA1LjcxNzJjLS40ODg0IDIuNzI5LTEuOTE5NiA1LjIyMjMtNC4wMzg0IDcuMDI1M0ExMS45MjYyIDExLjkyNjIgMCAwIDEgMTIuMDk3IDI0Yy0zLjE5MjUgMC02LjE5MzktMS4yNDc3LTguNDUyNy0zLjUxNDRDMS4zODY4IDE4LjIxODguMTQyNyAxNS4yMDQ0LjE0MjcgMTJjMC0zLjIwNDIgMS4yNDQtNi4yMTg3IDMuNTAxNS04LjQ4NTRDNS45MDE5IDEuMjQ4IDguOTAzMiAwIDEyLjA5NyAwYzIuNDM5NCAwIDQuNzg0Ny43MzMzIDYuNzgzIDIuMTE4NyAxLjk1MjYgMS4zNTQgMy40NDY2IDMuMjM1NyA0LjMyMjcgNS40NDIyLjExMTIuMjgyOS4yMTQ5LjU3MzYuMzA1MS44NjU3bC0yLjEyNTUgMS4yMzU5YTkuNDkyNCA5LjQ5MjQgMCAwIDAtLjI2MTktLjg2OTRjLTEuMzU0LTMuODMwMy00Ljk4MTMtNi40MDQ4LTkuMDIzNy02LjQwNDhDNi44MTcxIDIuMzg4MyAyLjUyMiA2LjcwMDUgMi41MjIgMTJjMCA1LjI5OTUgNC4yOTUgOS42MTE1IDkuNTc0OCA5LjYxMTUgMi4wNTIgMCA0LjAwODQtLjY0NDIgNS42NTk2LTEuODY0NyAxLjYxNzItMS4xOTU1IDIuODAzNi0yLjgzMzcgMy40MzA5LTQuNzM2NGwuMDA2NS0uMDQxOUw5LjU5MDYgOC4zMDQ4djcuMjI1Nmw0LjAwMDQtMi4zMTM4IDIuMDYgMS4xODExLTUuOTk2MiAzLjQ2ODgtMi4xMi0xLjIxMjZWNy4xOTQzbDIuMTE3NC0xLjIyNDUgNC4yMzA5IDIuNDI3OS0uMDAxMy0uMDAxMyIvPjwvc3ZnPg==)](https://elgato.com)

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
