---
sidebar_position: 4
---

# Settings

The Stream Deck SDK provides support for managing settings associated with your plugin. This is useful when you want to provide a higher level of configurability for your plugin, provide a persisted context to an action, or securely store an access token to an API, etc.

There are two types of settings:

- Action settings - settings associated with one of your plugin's actions.
- Global settings - plugin-wide settings.

Both types of settings can only be accessed by the plugin they are associated with.

## Overview

Global and action settings share similarities in their APIs, and both can be managed from either the application-layer, or [property inspector (UI)](./ui.md). Additionally, once settings have been set, the adjacent environment is notified of the update, for example:

- When updated in the property inspector, the application-layer is notified.
- When updated in the application-layer, and there is an active property inspector, the property inspector will notified.

The following table provides an overview of the common functions and events:

<Tabs>
<TabItem value="Action settings">

- [Writing](#writing-action-settings):
- `ev.action.setSettings(settings)`<sup>1</sup>
- [Reading](#reading-action-settings):
- `ev.payload.settings`
- `ev.action.getSettings()`<sup>1</sup>
- [Changed](#action-settings-changed):
- `SingletonAction.onDidReceiveSettings(handler)`
- `streamDeck.settings.onDidReceiveSettings(handler)`

<sup>1</sup> available whilst the action is visible.

> [!NOTE]
> In this context, `ev` are event arguments associated with an event emitted within the `SingletonAction` or from `streamDeck.*` for events that are associated with an action.

</TabItem>
<TabItem value="Global settings">

- [Writing](#writing-global-settings):
- `streamDeck.settings.setGlobalSettings(settings)`
- [Reading](#reading-global-settings):
- `streamDeck.settings.getGlobalSettings()`
- [Changed](#global-settings-changed):
- `streamDeck.settings.onDidReceiveGlobalSettings(handler)`

</TabItem>
</Tabs>

> [!NOTE]
> Settings are persisted as JSON objects, meaning values can be `boolean`, `number`, `string`, `null`, arrays, or objects.

## Action Settings

### Writing Settings {#writing-action-settings}

Settings can be associated with an instance of an action to provide it context. This is useful when you want to allow a user to customize a specific action provided by your plugin, or the action has a state that it manages, for example a counter.

The following example demonstrates setting `count` to 1 when the `Counter` action key is pressed down.

<!-- snippet: node/guides/settings/action-set.ts -->
```ts title="Write to settings on key down" {10-13}
import streamDeck, { action, type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.hello-world.counter" })
class Counter extends SingletonAction {
	/**
	 * Occurs when the user presses the key action.
	 */
	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		// Set the actions settings on key down.
		await ev.action.setSettings({
			count: 1,
		});
	}
}

streamDeck.actions.registerAction(new Counter());
streamDeck.connect();
```

> [!CAUTION]
> **Security**
>
> Security-sensitive settings, such as API keys, should always be persisted using [global settings](#global-settings), never action settings. Action settings are stored as plain-text and are included when exporting Stream Deck profiles, and in their nature action settings are not secure.

### Reading Settings {#reading-action-settings}

An action's settings are provided as part of the event arguments, for example when `onWillAppear` or `onKeyDown` occurs. By default, the settings' type is `JsonObject` and whilst this is fine when setting them, it isn't particularly useful when reading them. To fix this, a type that represents the settings should be defined separately, and provided when declaring the class.

The following example demonstrates defining the settings' type to provide intellisense when reading the settings from the event arguments:

<!-- snippet: node/guides/settings/action-typed.ts -->
```ts title="Using types with settings" {3-7,9-10,13-14}
import streamDeck, { action, type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

// Define the action's settings type.
type Settings = {
	count: number;
};

@action({ UUID: "com.elgato.hello-world.counter" })
class Counter extends SingletonAction<Settings> {
	/**
	 * Occurs when the user presses the key action.
	 */
	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		// `ev.payload.settings` now contains typed-settings.

		// Set the actions settings on key down.
		await ev.action.setSettings({
			count: 1,
		});
	}
}

streamDeck.actions.registerAction(new Counter());
streamDeck.connect();
```

> [!WARNING]
> **Type safety**
>
> Defining the type of your settings provides insight into what their type might be, but does not guarantee their underlying type. [Learn more about type-safety to prevent runtime errors](#type-safety).

> [!NOTE]
> **Event argument types**
>
> In the above the `KeyDownEvent` includes the settings type `Settings` to provide typing. This is also possible of other event arguments for events within the `SingletonAction` action, including:
>
> - `onDialDown`, `onDialRotate`, `onDialUp`, `onTouchTap`.
> - `onDidReceiveSettings`.
> - `onKeyDown`, `onKeyUp`.
> - `onTitleParametersDidChange`.
> - `onWillAppear`, `onWillDisappear`.

The following example demonstrates reading the settings as part of the `onKeyDown` event, and incrementing the count by one, and then updating the action's settings.

<!-- snippet: node/guides/settings/action-event-args.ts -->
```ts title="Access settings via event payload" {15}
import streamDeck, { action, type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

// Define the action's settings type.
type Settings = {
	count: number;
};

@action({ UUID: "com.elgato.hello-world.counter" })
class Counter extends SingletonAction<Settings> {
	/**
	 * Occurs when the user presses the key action.
	 */
	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		// Read the current count.
		let { count = 0 } = ev.payload.settings;
		count++;

		// Set the new count.
		await ev.action.setSettings({ count });
	}
}

streamDeck.actions.registerAction(new Counter());
streamDeck.connect();
```

> [!NOTE]
> You can also request a **visible** action's settings using `ev.action.getSettings()`; as there is no guarantee the action will be visible, we recommend using the settings supplied as part of the event arguments where possible.

### Settings Changed {#action-settings-changed}

Upon the settings of an action being set in the property inspector, your application-layer will receive an event allowing you to react accordingly, for example your plugin could set the image of the action based on the user's selection of a drop down:

<!-- snippet: node/guides/settings/action-did-receive-settings.ts -->
```ts title="Receive settings callback" {13-16}
import streamDeck, { action, type DidReceiveSettingsEvent, SingletonAction } from "@elgato/streamdeck";

// Define the action's settings type.
type Settings = {
	count: number;
};

@action({ UUID: "com.elgato.hello-world.counter" })
class Counter extends SingletonAction<Settings> {
	/**
	 * Occurs when the application-layer receives the settings from the UI.
	 */
	override onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): void {
		// Handle the settings changing in the property inspector (UI).
	}
}

streamDeck.actions.registerAction(new Counter());
streamDeck.connect();
```

<!-- prettier-ignore -->
<!--

<!-- prettier-ignore-end -->

## Action Settings in the UI

Unlike the application-layer, the property inspector is only contextually aware of a single instance of an action. For this reason, managing settings is handled slightly differently.

The settings associated with the action which the property inspector represents can be managed using the `getSettings` and `setSettings` functions found in the `settings` namespace. For example:

<!-- snippet: browser/guides/settings/action-get-and-set.ts -->
```ts title="Get settings in UI" {10-13}
import streamDeck from "@elgato/streamdeck";

// Define the action's settings type.
type Settings = {
	count: number;
};

// When the HTML button is pressed, increment the count by 1.
document.querySelector("button").addEventListener("click", async (ev) => {
	let { count = 0 } = await streamDeck.settings.getSettings<Settings>();
	count++;

	streamDeck.settings.setSettings({ count });
});
```

### Settings Availability

The settings of an action are first available to the property inspector as part of the `onDidConnect` event, and can then be managed using the `settings` namespace.

The following example demonstrates accessing the action's settings in the property inspector after it has been initialized:

<!-- snippet: browser/guides/settings/action-on-did-connect.ts -->
```ts title="Access the settings via connect payload" {6-9}
import streamDeck, { type ActionInfo } from "@elgato/streamdeck";

// Define the type of the action's settings.
type Settings = {};

streamDeck.onConnected((_, action: ActionInfo<Settings>) => {
	// Use the settings to load the UI.
	streamDeck.logger.info(action.payload.settings);
});
```

> [!TIP]
> Keeping the visible settings in the property inspector synchronized with the application-layer is important. Consider listening for settings being changed in the application-layer using the `onDidReceiveSettings` event, for example:
>
> ```ts title="Receive settings callback"
> // [!src browser/guides/settings/action-settings-changed.ts]
> ```

<!-- prettier-ignore -->
-->

<!-- prettier-ignore-end -->

## Global Settings

### Writing Settings {#writing-global-settings}

Global settings are persisted at the plugin-level, and are accessible only to the plugin that persisted them.

The following example demonstrates setting the global settings from the application-layer after receiving a deep-link message:

<!-- snippet: node/guides/settings/global-set.ts -->
```ts title="Write global settings from plugin" {4-7}
import streamDeck from "@elgato/streamdeck";

streamDeck.system.onDidReceiveDeepLink((ev) => {
	// Set the global settings after receiving a deep-link.
	streamDeck.settings.setGlobalSettings({
		messageReceived: true,
	});
});

streamDeck.connect();
```

> [!WARNING]
> **Security**
>
> Security-sensitive settings, such as access tokens, should always be persisted using global settings as these are stored securely on the user's local machine. However, as these are stored locally, users can access them. We therefore recommend you:
>
> - ✅ **Do:** use global settings for user-specific settings, for example OAuth2 access tokens or API keys provided by the user.
> - ✅ **Do:** use global settings for non-sensitive plugin-level settings.
> - ❌ **Don't:** use global settings for your plugin's secrets, for example API keys.

### Reading Settings {#reading-global-settings}

Retrieving global settings is achieved using `getGlobalSettings` found in the `settings` namespace, for example:

<!-- snippet: node/guides/settings/global-get-untyped.ts -->
```ts title="Get global settings in plugin" {4-5}
import streamDeck from "@elgato/streamdeck";

streamDeck.system.onDidReceiveDeepLink(async (ev) => {
	// Get the settings.
	const settings = await streamDeck.settings.getGlobalSettings();
});

streamDeck.connect();
```

When retrieving the global settings, the result has a type of `JsonObject` which does not allow intellisense to provide suggestions. To overcome this limitation, a type may be provided as part of the call to request the settings. The following combines the [reading](#reading-global-settings) and [writing](#writing-global-settings) examples, updated to demonstrate how typed settings can be used to track the number of deep-link messages received.

<!-- snippet: node/guides/settings/global-get-typed.ts -->
```ts title="Using types with global settings" {3-6,9-10}
import streamDeck from "@elgato/streamdeck";

// Define a type that represents the settings.
type Settings = {
	count: number;
};

streamDeck.system.onDidReceiveDeepLink(async (ev) => {
	// When getting the settings, supply the type.
	let { count = 0 } = await streamDeck.settings.getGlobalSettings<Settings>();

	count++;
	await streamDeck.settings.setGlobalSettings({ count });
});

streamDeck.connect();
```

> [!WARNING]
> **Type safety**
>
> Defining the type of your settings provides insight into what their type might be, but does not guarantee their underlying type. [Learn more about type-safety to prevent runtime errors](#type-safety).

### Settings Changed {#global-settings-changed}

In addition to explicitly requesting the global settings, the application-layer and property inspector can subscribe to an event to be notified when the other updates the global settings. For example, the property inspector can listen to changes to global settings made by the application-layer in the following way:

<!-- snippet: browser/guides/settings/global-event.ts -->
```ts title="Global settings callback" {3-5}
import streamDeck from "@elgato/streamdeck";

streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
	// Handle the global settings changing in application layer.
});
```

> [!TIP]
> The application-layer can also listen for the global settings changing in the property inspector using `onDidReceiveGlobalSettings` in the `settings` namespace.

## Type Safety

TypeScript types provide good insight into what values might be, but do not _guarantee_ the types of values. The following example demonstrates how runtime errors can occur, even with types.

<!-- snippet: node/guides/settings/runtime-error.ts -->
```ts title="Bad: Example of how runtime errors can occur" {17-18}
import { type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

type Settings = {
	name: string;
};

export class MyAction extends SingletonAction<Settings> {
	/**
	 * Occurs when the user presses the key action.
	 */
	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		/*
		 * Even though the settings are typed, if they have not
		 * been previously set, their values will be undefined.
		 */
		const { name } = await ev.action.getSettings();
		name.toLowerCase(); // Runtime error!
	}
}
```

To reduce runtime errors with data, you should always the check values before attempting to use them. When using values that might not be safe, we recommend:

- Use default values when destructuring objects that might be nullish.
- For complex types, consider using a schema validation library such as [Zod](https://zod.dev/).

The following example demonstrates using Zod to validate settings.

<!-- snippet: node/guides/settings/zod.ts -->
```ts title="Example of using Zod to validate data"
import { type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import z from "zod";

// Define the Zod schema.
const Settings = z.object({
	name: z.string().default("Elgato"),
});

// Infer the settings type.
type Settings = z.infer<typeof Settings>;

/**
 * An example action that demonstrates parsing settings with Zod.
 */
export class MyAction extends SingletonAction<Settings> {
	/**
	 * Occurs when the user presses the key action.
	 */
	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		/*
		 * Settings can safely be undefined here, Zod
		 * will fallback `name` to "Elgato".
		 */
		const { name } = Settings.parse(ev.payload.settings);
		name.toLowerCase(); // "elgato"
	}
}
```
