<!--

## {version}

⚠️ Breaking change
✨ New
🐞 Fix
♻️ Refactor / Enhance / Update

-->

# Change Log

## vNext

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

### ♻️ Update

-   Update layout and manifest references to propagate from [`@elgato/schemas`](https://github.com/elgatosf/schemas).

### ➡️ Migration

-   `PayloadObject<T>` replaced with `JsonObject`.
-   JSON schemas have been relocated to a dedicated schemas package, [`@elgato/schemas`](https://github.com/elgatosf/schemas).

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

### ⚠️ Breaking Changes

Namespaces have been introduced in place of the previous `streamDeck.client` object to provide better natural-grouping of functionality. Additionally, `streamDeck.devices` has been promoted to a namespace to allow for future enhancements, with devices remaining iterable. For more information, see [migration details](#0-2-0_migration).

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

<h3 id="0-2-0_migration">
	➡️ Migration
</h3>

> Functionality introduced in Stream Deck 6.5 requires the plugin's manifest to have a `Software.MinimumVersion` of 6.5 or higher.

Members previously accessed directly from `streamDeck.client` have been relocated to the following namespaces:

| Previous `streamDeck.client` Member | New Namespace                             |
| ----------------------------------- | ----------------------------------------- |
| `getGlobalSettings`                 | `streamDeck.settings`                     |
| `getSettings`                       | `streamDeck.actions.createController(id)` |
| `onApplicationDidLaunch`            | `streamDeck.system`                       |
| `onApplicationDidTerminate`         | `streamDeck.system`                       |
| `onDeviceDidConnect`                | `streamDeck.devices`                      |
| `onDeviceDidDisconnect`             | `streamDeck.devices`                      |
| `onDialDown`                        | `streamDeck.actions`                      |
| `onDialRotate`                      | `streamDeck.actions`                      |
| `onDialUp`                          | `streamDeck.actions`                      |
| `onDidReceiveGlobalSettings`        | `streamDeck.settings`                     |
| `onDidReceiveSettings`              | `streamDeck.settings`                     |
| `onKeyDown`                         | `streamDeck.actions`                      |
| `onKeyUp`                           | `streamDeck.actions`                      |
| `onPropertyInspectorDidAppear`      | `streamDeck.ui`                           |
| `onPropertyInspectorDidDisappear`   | `streamDeck.ui`                           |
| `onSendToPlugin`                    | `streamDeck.ui`                           |
| `onSystemDidWakeUp`                 | `streamDeck.system`                       |
| `onTitleParametersDidChange`        | `streamDeck.actions`                      |
| `onTouchTap`                        | `streamDeck.actions`                      |
| `onWillAppear`                      | `streamDeck.actions`                      |
| `onWillDisappear`                   | `streamDeck.actions`                      |
| `openUrl`                           | `streamDeck.system`                       |
| `sendToPropertyInspector`           | `streamDeck.actions.createController(id)` |
| `setFeedback`                       | `streamDeck.actions.createController(id)` |
| `setFeedbackLayout`                 | `streamDeck.actions.createController(id)` |
| `setGlobalSettings`                 | `streamDeck.settings`                     |
| `setImage`                          | `streamDeck.actions.createController(id)` |
| `setSettings`                       | `streamDeck.actions.createController(id)` |
| `setState`                          | `streamDeck.actions.createController(id)` |
| `setTitle`                          | `streamDeck.actions.createController(id)` |
| `setTriggerDescription`             | `streamDeck.actions.createController(id)` |
| `showAlert`                         | `streamDeck.actions.createController(id)` |
| `showOk`                            | `streamDeck.actions.createController(id)` |
| `switchToProfile`                   | `streamDeck.profiles`                     |

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
