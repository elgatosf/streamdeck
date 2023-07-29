<div align="center">

<!-- ![elgato/streamdeck npm](https://img.shields.io/npm/v/%40elgato/streamdeck?logo=npm) -->

![Stream Deck SDK npm package](https://img.shields.io/badge/npm-v0.1--beta-blue?labelColor=grey&logo=npm&logoColor=white)
[![SDK documentation](https://img.shields.io/badge/Documentation-2ea043?labelColor=grey&logo=gitbook&logoColor=white)](https://docs.elgato.com/sdk)
[![Join the Marketplace Makers Discord](https://img.shields.io/badge/Marketplace%20Makers-5662f6?labelColor=grey&logo=discord&logoColor=white)](https://discord.gg/GehBUcu627)
[![Elgato homepage](https://img.shields.io/badge/Elgato-3431cf?labelColor=grey&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RWxnYXRvPC90aXRsZT48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJtMTMuODgxOCA4LjM5NjQuMDI2MS4wMTk2IDkuOTQ5NCA1LjcxNzJjLS40ODg0IDIuNzI5LTEuOTE5NiA1LjIyMjMtNC4wMzg0IDcuMDI1M0ExMS45MjYyIDExLjkyNjIgMCAwIDEgMTIuMDk3IDI0Yy0zLjE5MjUgMC02LjE5MzktMS4yNDc3LTguNDUyNy0zLjUxNDRDMS4zODY4IDE4LjIxODguMTQyNyAxNS4yMDQ0LjE0MjcgMTJjMC0zLjIwNDIgMS4yNDQtNi4yMTg3IDMuNTAxNS04LjQ4NTRDNS45MDE5IDEuMjQ4IDguOTAzMiAwIDEyLjA5NyAwYzIuNDM5NCAwIDQuNzg0Ny43MzMzIDYuNzgzIDIuMTE4NyAxLjk1MjYgMS4zNTQgMy40NDY2IDMuMjM1NyA0LjMyMjcgNS40NDIyLjExMTIuMjgyOS4yMTQ5LjU3MzYuMzA1MS44NjU3bC0yLjEyNTUgMS4yMzU5YTkuNDkyNCA5LjQ5MjQgMCAwIDAtLjI2MTktLjg2OTRjLTEuMzU0LTMuODMwMy00Ljk4MTMtNi40MDQ4LTkuMDIzNy02LjQwNDhDNi44MTcxIDIuMzg4MyAyLjUyMiA2LjcwMDUgMi41MjIgMTJjMCA1LjI5OTUgNC4yOTUgOS42MTE1IDkuNTc0OCA5LjYxMTUgMi4wNTIgMCA0LjAwODQtLjY0NDIgNS42NTk2LTEuODY0NyAxLjYxNzItMS4xOTU1IDIuODAzNi0yLjgzMzcgMy40MzA5LTQuNzM2NGwuMDA2NS0uMDQxOUw5LjU5MDYgOC4zMDQ4djcuMjI1Nmw0LjAwMDQtMi4zMTM4IDIuMDYgMS4xODExLTUuOTk2MiAzLjQ2ODgtMi4xMi0xLjIxMjZWNy4xOTQzbDIuMTE3NC0xLjIyNDUgNC4yMzA5IDIuNDI3OS0uMDAxMy0uMDAxMyIvPjwvc3ZnPg==)](https://elgato.com)

</div>

<p align="center">
  <img src="./assets/SDK Github Banner.png">
	</p>

# Stream Deck SDK

Welcome to the official Node.js SDK for building Stream Deck plugins. Designed to make building with Stream Deck easy, our `@elgato/streamdeck` npm package provides everything you need to connect and communicate with Stream Deck, and lets you focus on the fun stuff.

## 📥 Prerequisites

This Stream Deck SDK utilizes [Node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/). We highly recommend installing them using a version manager, with our favorites being [nvm](https://github.com/creationix/nvm) and [nvm-windows](nvm-windows). With the version manager installed, you can install Node.js and npm via.

```bash
nvm install 20.1.0
nvm use 20.1.0
```

> Stream Deck plugins are ran using Node v20.1.0

## ✏️ Getting Started

With Node.js and npm installed, the easiest way to get started is using our creation wizard.

```bash
npm i -g @elgato/cli
streamdeck create
```

<p align="center">
  <img src="./assets/cli-create.gif">
</p>

## 📦 Example

```bash
npm i @elgato/streamdeck
```

```typescript
import * as streamDeck from "@elgato/streamdeck";

// Show an "OK" icon when an action is pressed.
streamDeck.client.onKeyDown(({ action }) => {
    action.showOk();
});
```

> Stream Deck plug-ins require scaffolding, and it is highly recommended to use the `streamdeck create` CLI command.

## 🌐 Manifest

_TODO_

## 📖 Usage

The top-level import `streamDeck` provides common functionality to assist with building, debugging, and communicating with the Stream Deck.

```typescript
import * as streamDeck from "@elgato/streamdeck";

/*
 * streamDeck.client
 * streamDeck.actions
 * streamDeck.devices
 * streamDeck.logger
 */
```

### 🔗 Client

The `streamDeck.client` acts as the main bridge between your plug-in, and the Stream Deck. The client provides event listeners for receiving events from Stream Deck e.g. when an action appears, and functions for sending request to the Stream Deck e.g. updating settings.

```typescript
import * as streamDeck from "@elgato/streamdeck";

streamDeck.client.onWillAppear(({ action }) => { ... });     // Occurs when an action appears.
streamDeck.client.onWillDisappear(({ action }) => { ... });  // Occurs when an action disappears.

streamDeck.client.setGlobalSettings(settings); // Updates the global settings.
streamDeck.client.switchToProfile(profile, device); // Switch to a pre-defined profile.
```

### 🗺️ Actions

The `streamDeck.actions` object provides information about actions currently visible on the Stream Deck, and methods for routing events of a specific action type; routing is particularly useful when your plug-in provides multiple actions.

```typescript
import * as streamDeck from "@elgato/streamdeck";

class ToggleOnOff extends streamDeck.SingletonAction {
    onKeyDown(ev) {
        // Occurs when key down happens for an action of type "com.elgato.test.toggle-on-off"
    }
}

class ChangeBrightness extends streamDeck.SingletonAction {
    onKeyDown(ev) {
        // Occurs when key down happens for an action of type "com.elgato.test.change-brightness"
    }
}

streamDeck.actions.registerAction("com.elgato.test.change-brightness", new ChangeBrightness());
streamDeck.actions.registerAction("com.elgato.test.toggle-on-off", new ToggleOnOff());
```

### 🎛️ Devices

The `streamDeck.devices` collection contains information about the user's Stream Deck devices.

```typescript
import * as streamDeck from "@elgato/streamdeck";

streamDeck.devices.forEach((device) => {
    // Device information.
});
```

### 📄 Logger

The `streamDeck.logger` provides local file-based logging capabilities, allowing you to diagnose, track, and debug potential problems. Logs files operate a file-rotation and are re-indexed when the current file exceeds 50MiB, with the 10 most recent files being retained. Logs can be found within the Stream Deck plugins folder, under `/logs`.

To assist with identifying the significant of a log, the following levels are available:

1. `ERROR`
1. `WARN`
1. `INFO`
1. `DEBUG`
1. `TRACE`

The default log level is `LogLevel.INFO`; this means `ERROR`, `WARN`, and `INFO` messages will be written. When the plug-in is run in debug mode, it is possible to change the default log-level.

```typescript
import * streamDeck from "@elgato/streamdeck";

streamDeck.logger.logError("Error message");
streamDeck.logger.logWarn("Warning message")
streamDeck.logger.logInfo("Information message");
streamDeck.logger.logDebug("Debug message"); // ❌ As the default log-level is INFO, this will not be written.
streamDeck.logger.logTrace("Trace message"); // ❌ As the default log-level is INFO, this will not be written.

streamDeck.logger.setLogLevel(streamDeck.LogLevel.TRACE)
streamDeck.logger.logDebug("Debug message"); // ✅ This will now be written.
streamDeck.logger.logTrace("Trace message"); // ✅ This will now be written.
```

> ⚠️ **Warning**
> When the log-level is set to `TRACE` **all** communication between the Stream Deck and the plug-in will be logged to the file system, this includes all settings. Please ensure sensitive information is not transmitted whilst `TRACE` is active.
