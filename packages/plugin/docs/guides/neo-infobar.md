---
sidebar_position: 4
---

# Neo Infobar

Neo Infobar actions are display-only actions that use the layout system to render information on the Infobar found on Stream Deck Neo. Unlike key and dial actions, they do not receive user interaction events. They can, however, display dynamic information and respond to updates from your plugin.

> [!TIP]
> Neo Infobar actions require Stream Deck 7.6 or later—be sure to update your manifest's [`Software.MinimumVersion`](../references/manifest.md#software-minimumversion) when adding support for them.

## Registering Actions

Neo Infobar actions are registered in the same way as other actions, in the manifest. Define the action's metadata in the manifest, including `Neo` in the [`Controllers`](../references/manifest.md#action-controllers) property:

```json title="Defining a Neo Infobar action in the manifest" {6}
{
	"Actions": [
		{
			"Name": "Neo Infobar Example Action",
			"UUID": "com.elgato.example.neo-infobar",
			"Controllers": ["Neo"]
		}
	]
}
```

Then implement the action as a class that inherits from `SingletonAction`, and register it in the application-layer entry file, as described in [Registering Actions](./actions.md#registering-actions).

## Layouts

Layouts are the rendering engine used to display information on a Stream Deck Neo Infobar. Layouts on Stream Deck Neo are 232 × 50 px, and are composed of [layout items](../references/layouts.md) whose values can be updated at runtime to display dynamic information.

The following is an example of a layout that renders the title, with an image on either side:

<!-- snippet: json/layouts/neo-infobar.json -->

```jsonc title="Layout JSON file for a Neo Infobar action"
{
    "$schema": "https://schemas.elgato.com/streamdeck/plugins/layout.json",
    "id": "neo",
    "controller": "Neo",
    "items": [
        {
            "type": "pixmap",
            "key": "leading",
            "rect": [10, 15, 20, 20]
        },
        {
            "key": "title",
            "type": "text",
            "rect": [40, 15, 152, 20],
            "font": {
                "size": 15
            }
        },
        {
            "key": "trailing",
            "type": "pixmap",
            "rect": [202, 15, 20, 20]
        }
    ]
}
```

![Stream Deck Neo Infobar layout with the title in the middle, and an image either side.](../assets/layout-neo-infobar.webp)

In summary, layout items within a layout:

- Must have a unique `key`.
- Must have their `type` and `rect` defined.
- Must not overlap with other items in the layout, see [`zOrder`](../references/layouts.md#bar-zorder).
- Must be within the bounds of the layout.

> [!WARNING]
> Layouts will not render when:
>
> - A layout item is outside the allotted bounds of the layout.
> - Layout items overlap on the same `zOrder`.
>
> For assistance with debugging layouts, try using the CLI tool's [`validate`](https://docs.elgato.com/streamdeck/cli/commands/validate) command, or referring to the [Stream Deck app logs](./logging.md#stream-deck-logs).

### Setting the Layout

The layout of a Neo Infobar action instance is set using the [`setFeedbackLayout`](#setfeedbacklayout) function, and must be set every time the [`onWillAppear`](#onwillappear) event occurs, for example:

<!-- snippet: node/guides/neo-infobar/set-feedback-layout.ts -->

```ts title="Action class updating its layout to a custom layout file" {11}
import { action, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.example.neo-infobar" })
export class NeoInfobarExampleAction extends SingletonAction {
	/**
	 * Occurs when the action appears.
	 */
	override async onWillAppear(ev: WillAppearEvent): Promise<void> {
		if (ev.action.isNeoInfobar()) {
			// Set the layout.
			await ev.action.setFeedbackLayout("layout.json");
		}
	}
}
```

### Updating Layout Items

Layout items can be updated at runtime using the [`setFeedback`](#setfeedback) function, with items referenced by their `key`. All properties, with the exception of their `rect` can be updated; in addition, the `value` of a layout item can be updated implicitly or explicitly.

The following example demonstrates updating the `value` of the `title` item implicitly:

<!-- snippet: node/guides/neo-infobar/set-feedback-implicitly.ts -->

```ts title="Updating the title implicitly" {15}
import { action, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.example.neo-infobar" })
export class NeoInfobarExampleAction extends SingletonAction {
	/**
	 * Occurs when the action appears.
	 */
	override async onWillAppear(ev: WillAppearEvent): Promise<void> {
		if (ev.action.isNeoInfobar()) {
			// Set the layout.
			await ev.action.setFeedbackLayout("layout.json");

			// Set the layout item values.
			await ev.action.setFeedback({
				title: "Hello world",
			});
		}
	}
}
```

The following example demonstrates updating the `value` of the `title` item explicitly; this is useful when more than one property needs to be updated on an item:

<!-- snippet: node/guides/neo-infobar/set-feedback-explicitly.ts -->

```ts title="Updating the title explicitly" {18}
import { action, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.example.neo-infobar" })
export class NeoInfobarExampleAction extends SingletonAction {
	/**
	 * Occurs when the action appears.
	 */
	override async onWillAppear(ev: WillAppearEvent): Promise<void> {
		if (ev.action.isNeoInfobar()) {
			// Set the layout.
			await ev.action.setFeedbackLayout("layout.json");

			// Set the layout item values.
			await ev.action.setFeedback({
				title: {
					opacity: 0.5,
					color: "#FF0000",
					value: "Hello world",
				},
			});
		}
	}
}
```

## Events

Neo Infobar actions receive the following events, available as overridable methods on the `SingletonAction` class.

<!-- generated: actions-events -->

### onDidReceiveResources

Occurs when the resources are updated within the property inspector.

```ts
function onDidReceiveResources?(ev: DidReceiveResourcesEvent): void | Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `ev` | `DidReceiveResourcesEvent` | Function to be invoked when the event occurs. |

### onDidReceiveSettings

Occurs when the settings are updated within the property inspector.

When `streamDeck.settings.useLegacySettingsBehavior` is set to `true`, this also fires after
calling `getSettings()`.

```ts
function onDidReceiveSettings?(ev: DidReceiveSettingsEvent): void | Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `ev` | `DidReceiveSettingsEvent` | Information about the event, including the source action and contextual payload information. |

### onPropertyInspectorDidAppear

Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. See also `streamDeck.ui.onDidAppear`.

```ts
function onPropertyInspectorDidAppear?(ev: PropertyInspectorDidAppearEvent): void | Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `ev` | `PropertyInspectorDidAppearEvent` | Information about the event, including the source action. |

### onPropertyInspectorDidDisappear

Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. See also `streamDeck.ui.onDidDisappear`.

```ts
function onPropertyInspectorDidDisappear?(ev: PropertyInspectorDidDisappearEvent): void | Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `ev` | `PropertyInspectorDidDisappearEvent` | Information about the event, including the source action. |

### onSendToPlugin

Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using `streamDeck.ui.sendToPropertyInspector`.

```ts
function onSendToPlugin?(ev: SendToPluginEvent): void | Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `ev` | `SendToPluginEvent` | Information about the event, including the source action and contextual payload information. |

### onTitleParametersDidChange

Occurs when the user updates an action's title settings in the Stream Deck application.

```ts
function onTitleParametersDidChange?(ev: TitleParametersDidChangeEvent): void | Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `ev` | `TitleParametersDidChangeEvent` | Information about the event, including the source action and contextual payload information. |

### onWillAppear

Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
page". An action refers to _all_ types of actions, e.g. keys, dials,

```ts
function onWillAppear?(ev: WillAppearEvent): void | Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `ev` | `WillAppearEvent` | Information about the event, including the source action and contextual payload information. |

### onWillDisappear

Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys,
dials, touchscreens, pedals, etc.

```ts
function onWillDisappear?(ev: WillDisappearEvent): void | Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `ev` | `WillDisappearEvent` | Information about the event, including the source action and contextual payload information. |

<!-- /generated -->

## Commands

The following commands are available to Neo Infobar actions.

> [!WARNING]
> Some events, such as [`onWillAppear`](./actions.md#onwillappear), are applicable to all action types. To invoke commands only available to Neo Infobar actions within these events, you must first assert the action is a Neo Infobar by calling [`ev.action.isNeoInfobar()`](./actions.md#isneoinfobar).

<!-- generated: neo-infobar-commands -->

### getResources

Gets the resources (files) associated with this action; these resources are embedded into the action when it is
exported, either individually, or as part of a profile.

Available from Stream Deck 7.1.

```ts
function getResources(): Promise<Resources>
```

### getSettings

Gets the settings associated this action instance.

```ts
function getSettings(): Promise<TSettings>
```

### setFeedback

Sets the feedback for the current layout associated with this action instance, allowing for the visual items to be
updated. Layouts are a powerful way to provide dynamic information to users, and can be assigned in the manifest,
or dynamically via `setFeedbackLayout`.

The `feedback` payload defines which items within the layout will be updated, and are identified by their property
name (defined as the `key` in the layout's definition). The values can either be a complete new definition, a `string`
for layout item types of `text` and `pixmap`, or a `number` for layout item types of `bar` and `gbar`.

```ts
function setFeedback(feedback: FeedbackPayload): Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `feedback` | `FeedbackPayload` | Object containing information about the layout items to be updated. |

### setFeedbackLayout

Sets the layout associated with this action instance. The layout must be a path to a local layout JSON file within
the plugin's folder. Use in conjunction with `setFeedback` to update the layout's current items' settings.

```ts
function setFeedbackLayout(layout: string): Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `layout` | `string` | Relative path to the layout file. |

### setResources

Sets the resources (files) associated with this action; these resources are embedded into the action when it is
exported, either individually, or as part of a profile.

Available from Stream Deck 7.1.

```ts
function setResources(resources: Resources): Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `resources` | `Resources` | The resources as a map of file paths. |

### setSettings

Sets the settings associated with this action instance.

```ts
function setSettings(value: TSettings): Promise<void>
```

**Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `value` | `TSettings` | Settings to persist. |

<!-- /generated -->
