<!--

## {version}

⚠️ Breaking change
✨ New
🐞 Fix
♻️ Refactor / Enhance / Update
⬆️ Upgrading

-->

# Change Log

## 0.4.0-beta.x

### ✨ New

-   Package can now be imported in both Node.js and the browser (in the scope of a property inspector).
-   Add support for property inspector.
    -   Add `streamDeck.onDidConnect` event listener.
    -   Add `streamDeck.settings` namespace for interacting with settings.
    -   Add `streamDeck.system` namespace for system-related operations.
    -   Add `streamDeck.plugin` namespace for bi-direction communication with the plugin and the UI.

### 🐞 Fix

-   `Coordinates` type could erroneously have a non-number type for `row`.
-   Fix support for allowed types within payloads.
-   Fix localization lookup to index from `Localization`.
-   Fix race condition when tracking the property inspector.

### ♻️ Update

-   Update layout and manifest references to propagate from [`@elgato/schemas`](https://github.com/elgatosf/schemas).
-   Localization lookup will now return the key if the resource is not defined.
-   Update structure of JSON localizations.
-   Update `State` type to allow for more than two states.
-   Update routing to prevent exposure of internal messages.
-   Update build to export Stream Deck API types.

### ⬆️ Upgrading

-   For information on breaking changes, and migrating to the this version, read more about [upgrading to v0.4.0](/UPGRADE.md#v0-4-0).

## 0.3.0

### ✨ New

-   Add cross-compatible event emitter with type support.
-   Add pattern validation for manifest's `Version`.
-   Add validation of colors defined within the manifest.

### 🐞 Fix

-   Fix `PayloadObject` not being exported; enables inheritance of actions.
-   Fix manifest layout not allowing `$A0` as a pre-defined value.

### ♻️ Update

-   Update manifest file path validation to prevent referencing a file outside of the plugin directory.
-   Update manifest file path validation to allow periods.
-   Update manifest UUID validation to allow more than 3 segments.
-   Update manifest UUID validation to prevent underscores.
-   Update documentation of `Actions[].Image` to reflect support for .gif files.
-   Update default export to be named (improving VSCode intellisense).

### 🗑️ Remove

-   Remove `$A2` incorrectly being listed as a pre-defined layout.

## 0.2.0

### ✨ New

#### Stream Deck 6.5

-   Add support for receiving messages via deep-linking.
    -   URL format: `streamdeck://plugins/message/<PLUGIN_UUID>/<MESSAGE>`
    -   Accessible as part of the `system` namespace, `streamDeck.system.onDidReceiveDeepLink`
-   Add support for switching to a specific profile page when calling `switchToProfile`.
-   Add `controller` information to `WillAppear` and `WillDisappear` events for multi-actions.
-   Add support for Node.js plugins with the `.cjs` or `.mjs` file extensions.

#### Node.js SDK

-   Add `profiles`, `settings`, `system`, and `ui` namespaces.
-   Add `streamDeck.actions.createController(id)` to enable the control of a contextualized action.
-   Add `streamDeck.devices.getDeviceBy(deviceId)` to enable the selection of a device by identifier.
-   Add `length`, `forEach`, and `[Symbol.iterator]` to `streamDeck.devices` to enable iteration.

### ♻️ Improvements

-   Refactor `streamDeck.devices` to namespace.
-   Update manifest JSON schema to support Stream Deck 6.5.
-   Improve enum support in manifest and layout JSON schemas.
-   Node.js runtime updated to v20.8.1.

### 🐞 Bug Fixes

-   Correctly validate paths without extensions in manifest JSON schema.
-   Default `text-overflow` set to `ellipsis` in layout JSON schema.

### ⬆️ Upgrading

-   For information on breaking changes, and migrating to the this version, read more about [upgrading to v0.2.0](/UPGRADE.md#v0-2-0).

## 0.1.0

### ✨ New

-   Add Stream Deck communication client (see `streamDeck.client`).
-   Add support for receiving all events (Stream Deck 6.4).
-   Add support for sending all commands (Stream Deck 6.4).
-   Add action routing (see `streamDeck.actions`).
-   Add centralized device information tracking (see `streamDeck.devices`).
-   Add local file-based logging framework (see `streamDeck.logger`).
-   Add localization support (see `streamDeck.i18n`).
-   Add manifest information (see `streamDeck.manifest`).
-   Add Stream Deck and plugin information (see `streamDeck.info`).
