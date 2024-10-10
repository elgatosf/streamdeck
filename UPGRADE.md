# Upgrade Guide

### Versions

-   [v1.0.0](#v1-0-0)
-   [v0.4.0](#v0-4-0)
-   [v0.2.0](#v0-2-0)

## <a id="v1-0-0"></a>v1.0.0

-   [Keys and Actions](#keys-and-dials)
-   [Action Controllers](#action-controllers)
-   [Device ID in Events](#device-id-in-events)
-   [sendToPropertyInspector](#sendtopropertyinspector)
-   [UI Connection Events](#ui-connecting-events)

### Keys and Dials

Actions provided to events have been improved to more accurately reflect methods and information available to them. For this reason, some methods may not be available until type-narrowing within events that apply to both keys and dials.

The following methods are now accessible through type-narrowing.

-   `KeyAction`, narrowed using `isKey()`, provides access to:
    -   `setImage` (options)
    -   `setState`
    -   `setTitle` (options)
    -   `showOk`
-   `DialAction`, narrowed using `isDial()`, provides access to:
    -   `setFeedback`
    -   `setFeedbackLayout`
    -   `setTriggerDescription`

**Before**

```ts
onWillAppear(ev: WillAppearEvent): void {
    ev.action.setFeedback({
        title: "Hello world"
    });
    ev.action.setState(0);
}
```

**After**

```ts
onWillAppear(ev: WillAppearEvent): void {
    if (ev.action.isDial()) { // <- Check the action is a dial.
        ev.action.setFeedback({
            title: "Hello world"
        });
    } else {
        ev.action.setState(0) // <- Action is a key, as it is not a dial
    }
}
```

### Action Controllers

Action controllers previously accessible via `streamDeck.actions.createController` have been superseded by visible actions, accessible via `streamDeck.actions.getActionById`.

**Before**

```ts
streamDeck.actions.createController(id);
```

**After**

```ts
streamDeck.actions.getActionById(id);
```

### Device ID in Events

The device identifier in event arguments has been superseded by the device itself, accessible on the `action` instance.

**Before**

```ts
onWillAppear(ev: WillAppearEvent): void {
    ev.deviceId;
}
```

**After**

```ts
onWillAppear(ev: WillAppearEvent): void {
    ev.action.device.id;
}
```

### sendToPropertyInspector

The `Action.sendToPropertyInspector` has been removed, in favour of sending message directly to the current property inspector, to prevent sending messages to actions without a property inspector active.

**Before**

```ts
onPropertyInspectorDidAppear(ev: PropertyInspectorDidAppearEvent): void {
    ev.action.sendToPropertyInspector(...);
}
```

**After**

```ts
onPropertyInspectorDidAppear(ev: PropertyInspectorDidAppearEvent): void {
    streamDeck.ui.current?.sendToPropertyInspector(...);
}
```

### UI Connecting Events

The `onDidConnect` event listener has been renamed within the UI to `onConnected`, and a new `onConnecting` event listener has been added to support the start of the connection being initialized.

**Before**

```ts
streamDeck.onDidConnect(listener);
```

**After**

```ts
streamDeck.onConnected(listener);
```

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
