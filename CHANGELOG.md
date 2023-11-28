<!--

## {version}

⚠️ Breaking change
✨ Add
🐞 Fix
♻️ Refactor / Enhance / Update

-->

# Change Log

## 0.2.0 (Pending)

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

### ♻️ Update

-   Refactor `streamDeck.devices` to namespace.
-   Update Manifest's JSON schema to support Stream Deck 6.5.
-   Node.js runtime updated to v20.8.2.

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
