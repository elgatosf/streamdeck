<p align="center">
	<img src="./assets/banner.png">
</p>
<div align="center">

### Stream Deck SDK (Beta)

[![Stream Deck npm package](https://img.shields.io/npm/v/%40elgato/streamdeck?logo=npm&logoColor=white)](https://www.npmjs.com/package/@elgato/streamdeck)
[![SDK documentation](https://img.shields.io/badge/Documentation-2ea043?labelColor=grey&logo=gitbook&logoColor=white)](https://docs.elgato.com/sdk)
[![Join the Marketplace Makers Discord](https://img.shields.io/badge/Marketplace%20Makers-5662f6?labelColor=grey&logo=discord&logoColor=white)](https://discord.gg/GehBUcu627)
[![Elgato homepage](https://img.shields.io/badge/Elgato-3431cf?labelColor=grey&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RWxnYXRvPC90aXRsZT48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJtMTMuODgxOCA4LjM5NjQuMDI2MS4wMTk2IDkuOTQ5NCA1LjcxNzJjLS40ODg0IDIuNzI5LTEuOTE5NiA1LjIyMjMtNC4wMzg0IDcuMDI1M0ExMS45MjYyIDExLjkyNjIgMCAwIDEgMTIuMDk3IDI0Yy0zLjE5MjUgMC02LjE5MzktMS4yNDc3LTguNDUyNy0zLjUxNDRDMS4zODY4IDE4LjIxODguMTQyNyAxNS4yMDQ0LjE0MjcgMTJjMC0zLjIwNDIgMS4yNDQtNi4yMTg3IDMuNTAxNS04LjQ4NTRDNS45MDE5IDEuMjQ4IDguOTAzMiAwIDEyLjA5NyAwYzIuNDM5NCAwIDQuNzg0Ny43MzMzIDYuNzgzIDIuMTE4NyAxLjk1MjYgMS4zNTQgMy40NDY2IDMuMjM1NyA0LjMyMjcgNS40NDIyLjExMTIuMjgyOS4yMTQ5LjU3MzYuMzA1MS44NjU3bC0yLjEyNTUgMS4yMzU5YTkuNDkyNCA5LjQ5MjQgMCAwIDAtLjI2MTktLjg2OTRjLTEuMzU0LTMuODMwMy00Ljk4MTMtNi40MDQ4LTkuMDIzNy02LjQwNDhDNi44MTcxIDIuMzg4MyAyLjUyMiA2LjcwMDUgMi41MjIgMTJjMCA1LjI5OTUgNC4yOTUgOS42MTE1IDkuNTc0OCA5LjYxMTUgMi4wNTIgMCA0LjAwODQtLjY0NDIgNS42NTk2LTEuODY0NyAxLjYxNzItMS4xOTU1IDIuODAzNi0yLjgzMzcgMy40MzA5LTQuNzM2NGwuMDA2NS0uMDQxOUw5LjU5MDYgOC4zMDQ4djcuMjI1Nmw0LjAwMDQtMi4zMTM4IDIuMDYgMS4xODExLTUuOTk2MiAzLjQ2ODgtMi4xMi0xLjIxMjZWNy4xOTQzbDIuMTE3NC0xLjIyNDUgNC4yMzA5IDIuNDI3OS0uMDAxMy0uMDAxMyIvPjwvc3ZnPg==)](https://elgato.com)

</div>

---

Welcome to the Node.js SDK for creating Stream Deck plugins. Designed to make building with Stream Deck easy, the SDK provides everything you need to connect and communicate with Stream Deck, and lets you focus on the fun stuff.

## 👋 You're Early!

Our Node.js SDK is currently in public early-access, and available to everyone running Stream Deck 6.4 or newer. If you're interested in building plugins with Node.js and would like to know more, please join our [Marketplace Makers Discord](https://discord.gg/GehBUcu627).

## 📥 Prerequisites

Stream Deck's Node.js SDK requires Node.js v20.1. We recommend installing Node.js with a version manager such as [nvm](https://github.com/creationix/nvm) (macOS) or [nvm-windows](nvm-windows) (Windows). Once installed, v20.1 can be installed via:

```bash
nvm install 20.1.0
nvm use 20.1.0
```

## 🚀 Quick Start

We recommend using [our CLI tool](https://github.com/elgatosf/cli) when building Stream Deck plugins which will guide you through creating a sample "counter" plugin, and scaffold everything required to run a plugin in a local environment.

1. Install our CLI tool, available from npm.

```bash
npm install -g @elgato/cli
```

2. Once installed, run the `create` command to initialize the creation wizard.

```
streamdeck create
```

<p align="center">
  <img src="./assets/cli-create.gif">
</p>

## 🗺️ Plugin Structure

After creating a plugin with `streamdeck create` you'll be provided with a set of files and folders that look as follows:

```
hello-world/
├── *.sdPlugin/
│   ├── bin/
│   ├── imgs/
│   ├── logs/
│   └── manifest.json
├── src/
│   ├── actions/
│   │   └── increment-counter.ts
│   └── plugin.ts
├── package.json
├── rollup.config.mjs
└── tsconfig.json
```

### \*.sdPlugin/

The root of the plugin; this folder contains the build output from your source files as well as assets that support your plugin, e.g. pre-defined profiles, icons, etc. Please note, this folder name changes based on your plugin's unique identifier (UUID), and under the hood is referenced by Stream Deck via s symbolic-link.

-   **manifest.json** - defines the plugin ([read more](https://docs.elgato.com/sdk/plugins/manifest)).
-   **bin/** - build output (generated from src).
-   **imgs/** - assets used by the plugin, e.g. action icons.
-   **logs/** - logs generated from `streamDeck.logger`.

### src/

-   **plugin.ts** - source code main entry point.
-   **actions/increment-counter.ts** - example "counter" action.

By default, there are also two npm scripts for building / watching changes, these are:

-   `npm run build`
-   `npm run watch`

## ✨ Actions

Actions are the star of the show and enable users to interact with plugins from Stream Deck device. At their core, actions are classes that extend an interface, which allows the SDK to route events emitted from Stream Deck to the appropriate action e.g. key down, dial rotate, etc.

The following is an example of an action that listens for the `keyDown` event, and then sets the title of the action to "Hello world" after being pressed.

> **src/actions/say-hello.ts**
>
> ```typescript Hello world
> import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
>
> @action({ UUID: "com.elgato.hello-world.say-hello" })
> export class SayHelloAction extends SingletonAction {
>     /**
>      * Listen for the key down event that occurs when a user presses
>      * a Stream Deck button, and change the title of the action.
>      */
>     async onKeyDown(ev: KeyDownEvent) {
>         await ev.action.setTitle("Hello world");
>     }
> }
> ```

We must then register the action in two places, firstly our sources' entry point...

> **src/plugin.ts**
>
> ```typescript
> import streamDeck from "@elgato/streamdeck";
>
> import { SayHelloAction } from "./actions/say-hello";
>
> // Register the action, and connect to Stream Deck.
> streamDeck.actions.registerAction(new SayHelloAction());
>
> streamDeck.connect();
> ```

And secondly within the `manifest.json` file...

> **\*.sdPlugin/manifest.json**
>
> ```jsonc
> {
>     // Learn more: https://docs.elgato.com/sdk/plugins/manifest
>     "Actions": [
>         {
>             "Name": "Say Hello",
>             "UUID": "com.elgato.hello-world.say-hello", // Note, this matches the UUID in the action class.
>             "States": [{ "TitleAlignment": "middle" }]
>         }
>     ]
> }
> ```

We can then run

```
npm run build
streamdeck restart com.elgato.hello-world
```

To see our changes. Alternatively we can run `npm run watch` to continually watch for changes and restart automatically.

### 🎛️ Devices

The `streamDeck.devices` collection contains information about known devices associated with the user. This includes information such as the id, name, and type of device. Additionally, as devices may not be connected at all times, the `device` object provides insight into the connectivity status of a device.

```typescript
import streamDeck from "@elgato/streamdeck";

streamDeck.devices.forEach((device) => {
    // Device information including id, name, type, etc.
});
```

## 📄 Logging

The `streamDeck.logger` object provides local file-based logging, allowing you to diagnose, track, and debug your plugin. Logs files operate a file-rotation policy and are re-indexed when the plugin starts or they exceed 50MiB, with the 10 most recent log files being retained.

```typescript
import streamDeck, { LogLevel } from "@elgato/streamdeck";

const logger = streamDeck.logger.createScope("Custom Scope");

logger.error("Error message");
logger.warn("Warning message");
logger.info("Information message");
logger.debug("Debug message"); // ❌ Default level is INFO
logger.trace("Trace message"); // ❌ Default level is INFO

logger.setLevel(LogLevel.TRACE);

logger.debug("Debug message"); // ✅
logger.trace("Trace message"); // ✅
```

> When the log-level is set to `TRACE` **all** communication between the Stream Deck and the plugin will be logged to the file system, this includes all settings. Please ensure sensitive information is not transmitted whilst `TRACE` is active.
