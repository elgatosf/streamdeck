---
sidebar_position: 9
---

# Embedded Resources

Embedding resources, such audio or configuration files, into instances of actions actions makes them more portable, allowing you and others to easily share fully-working profiles that depend on your plugin.

## Overview

Resources can be embedded into instances of actions, making them self-contained and more portable. When an action with embedded resources is exported, the resources are compressed along with the necessary metadata into the `.streamDeckProfile` or `.streamDeckAction` file, making it easy to share profiles on Marketplace that depend on your plugin.

Examples of types of actions where this can be useful include:

- Audio players and soundboards
- App scripts, such as with Photoshop Play action
- External configuration files

<Note>
  Available from Stream Deck 7.1 or higher.
</Note>

## Embedding Resources

Much like [settings](./settings.md), resources are associated with an instance of an action, and are mapped using a similar interface:

- [`action.setResources`](./actions.md#setresources) - Sets resources associated with an instance of an action.
- [`action.getResources`](./actions.md#getresources) - Gets resources associated with an instance of an action.
- [`SingletonAction.onDidReceiveResources`](./actions.md#ondidreceiveresources) - Occurs when resources are updated within the property inspector.

<Tip>
  Resources use Stream Deck's new message identifiers, meaning `onDidReceiveResources` is **only** called when the resources were updated within the property inspector. This makes it easier to distinguish between when resources were updated versus requested.
</Tip>

Unlike settings, the payload is not arbitrary and must be a map of key/file-path to allow Stream Deck to update file paths when importing an action.

The following example demonstrates embedding a resource into an instance of an action:

<!-- snippet: node/guides/resources/set.ts -->

```ts title="Embedding resources" {9-12}
import { action, type DidReceiveSettingsEvent, SingletonAction } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.audio.play" })
class PlayAudio extends SingletonAction {
	/**
	 * Occurs when the settings are updated.
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
		await ev.action.setResources({
			audioFile: ev.payload.settings.userSelectedFile,
		});
	}
}

type Settings = {
	userSelectedFile: string;
};
```

With the resource now embedded into the action, the file be compressed alongside the action's metadata when the action or parent profile is exported.

## Accessing Resources

Accessing embedded resource file paths can be achieved using either:

- [`action.getResources`](./actions.md#getresources)
- [`SingletonAction.onDidReceiveResources`](./actions.md#ondidreceiveresources)

Continuing from the above `PlayAction` example, the following demonstrates playing the embedded audio file when the action's key down occurs.

<!-- snippet: node/guides/resources/get.ts -->

```ts title="Accessing resources" {20-24}
import { action, type DidReceiveSettingsEvent, type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

import { audioService } from "./audio-service";

@action({ UUID: "com.elgato.audio.play" })
class PlayAudio extends SingletonAction {
	/**
	 * Occurs when the settings are updated.
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
		await ev.action.setResources({
			audioFile: ev.payload.settings.userSelectedFile,
		});
	}

	/**
	 * Occurs when the key is pressed down.
	 */
	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		const filePath = ev.payload.resources.audioFile;
		if (filePath) {
			await audioService.play(ev.payload.resources.audioFile);
		}
	}
}

type Settings = {
	userSelectedFile: string;
};
```

## File Paths

When setting resources, the payload must be a map of file paths identifiable by a key, for example:

```ts title="Original action resources"
{
    fileOne: "C:\\audio\\track.mp3",
    fileTwo: "C:\\config.json"
}
```

Using this map structure ensures Stream Deck can mutate the file paths when an action or profile is imported. For example, if the above action were to be exported and imported into another Stream Deck, the file paths may look as follows:

```ts title="Imported action resources"
{
    fileOne: "C:\\...\\7ae61d68-6882-41dd-8e90-3c54114fa2cf\\track.mp3",
    fileTwo: "C:\\...\\7ae61d68-6882-41dd-8e90-3c54114fa2cf\\config.json"
}
```

<Tip>
  The file name of an embedded resource is unchanged when exporting / importing an action.
</Tip>
