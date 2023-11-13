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

Namespaces have been introduced in place of the previous `streamDeck.client` namespace to provide better natural-grouping of functionality. Additionally, `streamDeck.devices` has been promoted to a namespace to allow for future enhancements, with devices remaining iterable.

Members previously found on `streamDeck.client` have been relocated to the following namespaces:

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

### ✨ New

-   Add `profiles`, `settings`, `system`, and `ui` namespaces.
-   Add `streamDeck.actions.createController(id)` to enable the control of a contextualized action.
-   Add `streamDeck.devices.getDeviceBy(deviceId)` to enable the selection of a device by identifier.
-   Add `length`, `forEach`, and `[Symbol.iterator]` to `streamDeck.devices` to enable iteration.

### ♻️ Update

-   Refactor `streamDeck.devices` to namespace.

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
