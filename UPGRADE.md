# Upgrade Guide

**Versions**

-   [v0.4.0](#v0-4-0)
-   [v0.2.0](#v0-2-0)

## <a id="v0-4-0"></a>v0.4.0

-   [Localization JSON structure](#localization-json-structure)
-   [Localization lookup](#localization-lookup)
-   [`PayloadObject<T>`](#payloadobjectt)
-   [JSON schemas](#json-schemas)

### Localization JSON structure

Localizations within JSON files must now be nested under a `Localization` object, for example.

**Before**

```json
{
    "Hello world": "Hallo Welt"
}
```

**v0.4.0**

```json
{
    "Localization": {
        "Hello world": "Hallo Welt"
    }
}
```

### Localization lookup

Localization lookup will now return the `key` when the localization cannot be found, for example, given the localizations above:

**Before**

```ts
import streamDeck from "@elgato/streamdeck";
streamDeck.i18n.translate("test"); // undefined
```

**v0.4.0**

```ts
import streamDeck from "@elgato/streamdeck";
streamDeck.i18n.translate("test"); // "test"
```

### `PayloadObject<T>`

The previous `PayloadObject<T>` has been deprecated in favour of the newer `JsonObject` type. The `JsonObject` is now the primary constraint for action settings types, and can be used to create base actions.

**Before**

```ts
export class BaseAction<T extends PayloadObject<T>> extends SingletonAction<T> {
```

**v0.4.0**

```ts
export class BaseAction<T extends JsonObject> extends SingletonAction<T> {
```

### JSON schemas

Manifest and layout JSON schemas have been relocated to [`@elgato/schemas`](https://github.com/elgatosf/schemas), and are now publicly accessible:

-   [Manifest schema](https://schemas.elgato.com/streamdeck/plugins/manifest.json)
-   [Layout schema](https://schemas.elgato.com/streamdeck/plugins/layout.json)

**Before**

```json
"$schema": "../node_modules/@elgato/streamdeck/schemas/manifest.json"
```

**After**

```json
"$schema": "https://schemas.elgato.com/streamdeck/plugins/manifest.json"
```

## <a id="v0-2-0"></a>v0.2.0

Namespaces have been introduced in place of the previous `streamDeck.client` object to provide better natural-grouping of functionality. Additionally, `streamDeck.devices` has been promoted to a namespace to allow for future enhancements, with devices remaining iterable.

Members previously accessed directly from `streamDeck.client` have been relocated to the following namespaces:

| Before, `streamDeck.client` member | v0.2.0 namespace                          |
| ---------------------------------- | ----------------------------------------- |
| `getGlobalSettings`                | `streamDeck.settings`                     |
| `getSettings`                      | `streamDeck.actions.createController(id)` |
| `onApplicationDidLaunch`           | `streamDeck.system`                       |
| `onApplicationDidTerminate`        | `streamDeck.system`                       |
| `onDeviceDidConnect`               | `streamDeck.devices`                      |
| `onDeviceDidDisconnect`            | `streamDeck.devices`                      |
| `onDialDown`                       | `streamDeck.actions`                      |
| `onDialRotate`                     | `streamDeck.actions`                      |
| `onDialUp`                         | `streamDeck.actions`                      |
| `onDidReceiveGlobalSettings`       | `streamDeck.settings`                     |
| `onDidReceiveSettings`             | `streamDeck.settings`                     |
| `onKeyDown`                        | `streamDeck.actions`                      |
| `onKeyUp`                          | `streamDeck.actions`                      |
| `onPropertyInspectorDidAppear`     | `streamDeck.ui`                           |
| `onPropertyInspectorDidDisappear`  | `streamDeck.ui`                           |
| `onSendToPlugin`                   | `streamDeck.ui`                           |
| `onSystemDidWakeUp`                | `streamDeck.system`                       |
| `onTitleParametersDidChange`       | `streamDeck.actions`                      |
| `onTouchTap`                       | `streamDeck.actions`                      |
| `onWillAppear`                     | `streamDeck.actions`                      |
| `onWillDisappear`                  | `streamDeck.actions`                      |
| `openUrl`                          | `streamDeck.system`                       |
| `sendToPropertyInspector`          | `streamDeck.actions.createController(id)` |
| `setFeedback`                      | `streamDeck.actions.createController(id)` |
| `setFeedbackLayout`                | `streamDeck.actions.createController(id)` |
| `setGlobalSettings`                | `streamDeck.settings`                     |
| `setImage`                         | `streamDeck.actions.createController(id)` |
| `setSettings`                      | `streamDeck.actions.createController(id)` |
| `setState`                         | `streamDeck.actions.createController(id)` |
| `setTitle`                         | `streamDeck.actions.createController(id)` |
| `setTriggerDescription`            | `streamDeck.actions.createController(id)` |
| `showAlert`                        | `streamDeck.actions.createController(id)` |
| `showOk`                           | `streamDeck.actions.createController(id)` |
| `switchToProfile`                  | `streamDeck.profiles`                     |
