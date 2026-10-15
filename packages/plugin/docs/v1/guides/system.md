---
sidebar_position: 8
---

# System

The Stream Deck SDK provides utilities to streamline interacting with common system functionality, such as [monitoring an app launching or terminating](./app-monitoring.md) and [receiving deep-links](./deep-linking.md). In addition to these, the following utilities are available.

## Opening URLs

There may be occasions when your plugin needs to direct the user to a website in their browser, for example when authenticating a service, or when the user is seeking help. This can be achieved with the following utility:

<!-- snippet: node/guides/system/open-url.ts -->
```ts title="Open URL from plugin" {4}
import streamDeck from "@elgato/streamdeck";

streamDeck.actions.onKeyDown(() => {
	streamDeck.system.openUrl("https://elgato.com");
});

streamDeck.connect();
```

The above example will open `https://elgato.com` in the user's default browser.

> [!NOTE]
> All URLs are opened in the user's default browser. Custom URL schemes, for example `my-app://` are not yet supported by the SDK.

## System Wake

Handling system wake correctly is an important part of ensuring your plugin resumes seamlessly. As part of the system wake procedure, your plugin will receive the following events:

- `onWillAppear` for all visible actions.
- A one-time `onSystemDidWakeUp` event.

The latter `systemDidWakeUp` event can be used to restore connections / state, for example a websocket connection with an API, or IPC with local app. Listening for this event is achieved with the following:

<!-- snippet: node/guides/system/system-wake.ts -->
```ts title="System wake callback" {3-5}
import streamDeck from "@elgato/streamdeck";

streamDeck.system.onSystemDidWakeUp((ev) => {
	// Handle system wake.
});

streamDeck.connect();
```

> [!WARNING]
> `onSystemDidWakeUp` is only available in the context of the plugin, and is not available in the property inspector.
