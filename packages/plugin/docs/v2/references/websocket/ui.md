---
sidebar_position: 2
---

# Property Inspector (UI)

The property inspector (UI) connects to Stream Deck using a WebSocket, allowing it to directly receive a subset of events, and send commands. The WebSocket connection also allows the property inspector to communicate with the application-layer (i.e. the plugin).

## Registration

<Tabs>
<TabItem value="Manually">

A connection with Stream Deck is established within the property inspector by defining a function on the `window`, named [`connectElgatoStreamDeckSocket`](#connectelgatostreamdecksocket). Once the DOM has loaded, Stream Deck will invoke this function and provide registration information, including the port to connect on.

Below is an example of implementing the `connectElgatoStreamDeckSocket` function to establish a connection with Stream Deck:

```js title="Connecting to Stream Deck in the property inspector"
window.connectElgatoStreamDeckSocket = (port, uuid, event, info, actionInfo) => {
	const infoObj = JSON.parse(info); // Information about Stream Deck and the plugin.
    const actionInfo = JSON.parse(actionInfo); // Information about the action the UI is for.

    // Establish a connection with Stream Deck
	const connection = new WebSocket(`ws://127.0.0.1:${port}`);
	connection.onopen = () => {
		connection.send(JSON.stringify({ event, uuid }));
	};
};
```

</TabItem>
<TabItem value="Automatically">

Registration within the property inspector is automatically managed by [sdpi-components](https://sdpi-components.dev/), and a [Stream Deck Client](https://sdpi-components.dev/docs/helpers/stream-deck-client) is available to make communicating with Stream Deck easy. For example.

```js title="Get global settings in the property inspector"
SDPIComponents
	.streamDeckClient
	.getGlobalSettings()
	.then((settings) => {
		console.log(settings);
	});
```

</TabItem>
</Tabs>

<!-- Snapshot of the property inspector protocol (@streamdeck/ui); this section is not generated. -->

### connectElgatoStreamDeckSocket

Connects to the Stream Deck, enabling the UI to interact with the plugin, and access the Stream Deck API.

```ts
window.connectElgatoStreamDeckSocket = (port: string, uuid: string, event: string, info: string, actionInfo: string) => void | Promise<void>
```

**Parameters**

| Name | Description |
| --- | --- |
| port | Port to be used when connecting to Stream Deck. |
| uuid | Identifies the UI; this must be provided when establishing the connection with Stream Deck. |
| event | Name of the event that identifies the registration procedure; this must be provided when establishing the connection with Stream Deck. |
| info | Information about the Stream Deck application and operating system. |
| actionInfo | Information about the action the UI is associated with. |

### RegistrationInfo

Information about the Stream Deck application, the plugin, the user's operating system, user's Stream Deck devices, etc.

```ts
type RegistrationInfo = {
	application: {
		font: string;
		language: "de" | "en" | "es" | "fr" | "ja" | "ko" | "zh_CN" | "zh_TW";
		platform: "mac" | "windows";
		platformVersion: string;
		version: string;
	};
	colors: {
		buttonMouseOverBackgroundColor: string;
		buttonPressedBackgroundColor: string;
		buttonPressedBorderColor: string;
		buttonPressedTextColor: string;
		highlightColor: string;
	};
	devicePixelRatio: number;
	devices: {
		id: string;
		name: string;
		size: {
			columns: number;
			rows: number;
		};
		type: DeviceType;
	}[];
	plugin: {
		uuid: string;
		version: string;
	};
};
```

**Properties**

- `application`: `object`

  Stream Deck application specific information.

  - `font`: `string`

    Font being used by the Stream Deck application.

  - `language`: `"de" | "en" | "es" | "fr" | "ja" | "ko" | "zh_CN" | "zh_TW"`

    Users preferred language; this is used by the Stream Deck application for localization.

  - `platform`: `"mac" | "windows"`

    Operating system.

  - `platformVersion`: `string`

    Operating system version, e.g. "10" for Windows 10.

  - `version`: `string`

    Stream Deck application version.

- `colors`: `object`

  Collection of preferred colors used by the Stream Deck.

  - `buttonMouseOverBackgroundColor`: `string`

    Color that denotes the background of a button that is being moused over.

  - `buttonPressedBackgroundColor`: `string`

    Color that denotes the background of a pressed button.

  - `buttonPressedBorderColor`: `string`

    Color that denotes the border of a press button.

  - `buttonPressedTextColor`: `string`

    Color that denotes the text of a pressed button.

  - `highlightColor`: `string`

    Color of highlighted text.

- `devicePixelRatio`: `number`

  Pixel ratio, used to identify if the Stream Deck application is running on a high DPI screen.

- `devices`: `object[]`

  Devices associated with the Stream Deck application; this may include devices that are not currently connected. Use `"deviceDidConnect"` event to determine which devices are active.

- `plugin`: `object`

  Information about the plugin.

  - `uuid`: `string`

    Unique identifier of the plugin, as defined by the plugin.

  - `version`: `string`

    Version of the plugin.

## Events

<!-- Snapshot of the property inspector protocol (@streamdeck/ui); this section is not generated. -->

### DidReceiveGlobalSettings

Occurs when the settings associated with the plugin are requested, or when the the plugin's settings
were updated by the plugin.

```ts
type DidReceiveGlobalSettings = {
    event: "didReceiveGlobalSettings";
    payload: {
        settings: JsonObject;
    };
};
```

**Properties**

- `event`: `"didReceiveGlobalSettings"`

  Name of the event.

- `payload`: `object`

  Additional information about the event.

  - `settings`: `JsonObject`

    Global settings associated with this plugin.

### DidReceiveResources

Occurs when the resources associated with an action instance are requested, or when the the resources
are updated in the property inspector.

```ts
type DidReceiveResources = {
    action: string;
    context: string;
    device: string;
    event: "didReceiveResources";
    id?: string;
    payload:
        | {
              controller: "Keypad";
              isInMultiAction: true;
              resources: {
                  [key: string]: string;
              };
              settings: JsonObject;
              state?: number;
          }
        | {
              controller: "Encoder" | "Keypad" | "Neo";
              coordinates: {
                  column: number;
                  row: number;
              };
              isInMultiAction: false;
              resources: {
                  [key: string]: string;
              };
              settings: JsonObject;
              state?: number;
          };
};
```

**Properties**

- `action`: `string`

  Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".

- `context`: `string`

  Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and
  request settings associated with the action instance, etc.

- `device`: `string`

  Unique identifier of the Stream Deck device that this event is associated with.

- `event`: `"didReceiveResources"`

  Name of the event used to identify what occurred.

- `id`: `string` (optional)

  Identifier provided when requesting the resources, used to identify the source of the request.

  This is always undefined if the event is received because the resources were changed in the property
  inspector.

- `payload`: `MultiActionPayload | SingleActionPayload`

  Contextualized information for this event.

  One of:

### DidReceiveSettings

Occurs when the settings associated with an action instance are requested, or when the the settings
were updated by the plugin.

```ts
type DidReceiveSettings = {
    action: string;
    context: string;
    device: string;
    event: "didReceiveSettings";
    payload:
        | {
              controller: "Keypad";
              isInMultiAction: true;
              settings: JsonObject;
              state?: number;
          }
        | {
              controller: "Keypad" | "Encoder" | "Neo";
              coordinates: {
                  column: number;
                  row: number;
              };
              isInMultiAction: false;
              settings: JsonObject;
              state?: number;
          };
};
```

**Properties**

- `action`: `string`

  Identifies the action type, as specified by the UUID within the manifest.

- `context`: `string`

  Identifier for the instance of the action the event is for.

- `device`: `string`

  Identifier for the Stream Deck device the action is on.

- `event`: `"didReceiveSettings"`

  Name of the event.

- `payload`: `ActionPayload`

  Additional information about the action.

  One of:

### SendToPropertyInspector

Occurs when a payload was sent to the property inspector from the plugin.

```ts
type SendToPropertyInspector = {
    action: string;
    context: string;
    event: "sendToPropertyInspector";
    payload: JsonValue;
};
```

**Properties**

- `action`: `string`

  Identifies the action type, as specified by the UUID within the manifest.

- `context`: `string`

  Identifier for the instance of the action the event is for.

- `event`: `"sendToPropertyInspector"`

  Name of the event.

- `payload`: `JsonValue`

  The payload sent to the property inspector.

## Commands

<!-- Snapshot of the property inspector protocol (@streamdeck/ui); this section is not generated. -->

### GetGlobalSettings

Gets the global settings associated with the plugin. Causes `didReceiveGlobalSettings` to be emitted.

```ts
type GetGlobalSettings = {
    context: string;
    event: "getGlobalSettings";
    id?: string;
};
```

**Properties**

- `context`: `string`

  The plugin's identifier, as provided by Stream Deck.

- `event`: `"getGlobalSettings"`

  Name of the command.

- `id`: `string` (optional)

  Optional identifier that can be used to identify the response to this request.

### GetResources

Gets the resources (files) associated with the action; these resources are embedded into the action
when it is exported, either individually, or as part of a profile.

Available from Stream Deck 7.1.

```ts
type GetResources = {
    action: string;
    context: string;
    event: "getResources";
    id?: string;
};
```

**Properties**

- `action`: `string`

  Identifies the action type, as specified by the UUID within the manifest.

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"getResources"`

  Name of the command, used to identify the request.

- `id`: `string` (optional)

  Optional identifier that can be used to identify the response to this request.

### GetSettings

Gets the settings associated with an instance of an action. Causes `didReceiveSettings` to be emitted.

```ts
type GetSettings = {
    action: string;
    context: string;
    event: "getSettings";
    id?: string;
};
```

**Properties**

- `action`: `string`

  Identifies the action type, as specified by the UUID within the manifest.

- `context`: `string`

  The action instance identifier.

- `event`: `"getSettings"`

  Name of the command.

- `id`: `string` (optional)

  Optional identifier that can be used to identify the response to this request.

### OpenUrl

Opens the URL in the user's default browser.

```ts
type OpenUrl = {
    event: "openUrl";
    payload: {
        url: string;
    };
};
```

**Properties**

- `event`: `"openUrl"`

  Name of the command.

- `payload`: `object`

  Additional information supplied as part of the command.

  - `url`: `string`

    URL to open.

### SendToPlugin

Sends a message to the plugin.

```ts
type SendToPlugin = {
    action: string;
    context: string;
    event: "sendToPlugin";
    payload: JsonValue;
};
```

**Properties**

- `action`: `string`

  Identifies the action type, as specified by the UUID within the manifest.

- `context`: `string`

  The action instance identifier.

- `event`: `"sendToPlugin"`

  Name of the command.

- `payload`: `JsonValue`

  Payload to send.

### SetGlobalSettings

Sets the global settings associated with the plugin, and notifies the plugin by emitting `didReceiveGlobalSettings`.

```ts
type SetGlobalSettings = {
    context: string;
    event: "setGlobalSettings";
    payload: JsonObject;
};
```

**Properties**

- `context`: `string`

  The plugin's identifier, as provided by Stream Deck.

- `event`: `"setGlobalSettings"`

  Name of the command.

- `payload`: `JsonObject`

  Global settings to save.

### SetResources

Sets the resources (files) associated with the action; these resources are embedded into the action
when it is exported, either individually, or as part of a profile.

Available from Stream Deck 7.1.

```ts
type SetResources = {
    action: string;
    context: string;
    event: "setResources";
    payload: {
        [key: string]: string;
    };
};
```

**Properties**

- `action`: `string`

  Identifies the action type, as specified by the UUID within the manifest.

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"setResources"`

  Name of the command, used to identify the request.

- `payload`: `Resources`

  Resources (files) associated with the action.

### SetSettings

Sets the settings associated with an action instance, and notifies the plugin by emitting `didReceiveSettings`.

```ts
type SetSettings = {
    action: string;
    context: string;
    event: "setSettings";
    payload: JsonObject;
};
```

**Properties**

- `action`: `string`

  Identifies the action type, as specified by the UUID within the manifest.

- `context`: `string`

  The action instance identifier.

- `event`: `"setSettings"`

  Name of the command.

- `payload`: `JsonObject`

  Action settings to save.
