---
sidebar_position: 1
---

# Plugin

Stream Deck provides an API for distributing plugins as native console apps, for example those written in C++, C#, etc, with communication being handled by a dedicated WebSocket connection.

> [!WARNING]
> Creating native plugins is an advanced technique, and is not recommended. Instead, consider using the Stream Deck SDK with [Node.js native addons](https://nodejs.org/api/n-api.html#node-api).

## Registration

In order to establish a connection with Stream Deck, your plugin must first register itself using a unique identifier. The information required to establish the connection is provided as a command line parameter, along with:

| Parameter                          | Description                                                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `-port`                            | The port the WebSocket is running on.                                                                                                                  |
| `-info`                            | A serialized JSON string that contains information about Stream Deck, Stream Deck devices, and your plugin. See [RegistrationInfo](#registrationinfo). |
| `-pluginUUID`                      | Your plugin's unique registration identifier.                                                                                                          |
| <code>&#x2011;registerEvent</code> | Name of the registration event.                                                                                                                        |

Upon startup, your plugin must connect to the WebSocket on the specified `-port`, and send a registration message as a JSON serialized string in the following format:

```ts title="Registration event type"
type RegisterEvent = {
	event: string; // -registerEvent parameter
	uuid: string; // -pluginUUID parameter
};
```

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

Plugins can receive the following events from Stream Deck via their WebSocket connection.

> [!WARNING]
> The `context` of an action is not guaranteed to persist across app cycles and therefore should not be used as a long-term identifier externally.

### ApplicationDidLaunch

Occurs when a monitored application is launched. Monitored applications can be defined in the `manifest.json` file via the `Manifest.ApplicationsToMonitor` property. See also
`ApplicationDidTerminate`.

```ts
type ApplicationDidLaunch = {
	event: "applicationDidLaunch";
	payload: {
		application: string;
	};
};
```

**Properties**

- `event`: `"applicationDidLaunch"`

  Name of the event used to identify what occurred.

- `payload`: `object`

  Payload containing information about the application that triggered the event.

  - `application`: `string`

    Name of the application that triggered the event.

### ApplicationDidTerminate

Occurs when a monitored application terminates. Monitored applications can be defined in the `manifest.json` file via the `Manifest.ApplicationsToMonitor` property. See also
`ApplicationDidLaunch`.

```ts
type ApplicationDidTerminate = {
	event: "applicationDidTerminate";
	payload: {
		application: string;
	};
};
```

**Properties**

- `event`: `"applicationDidTerminate"`

  Name of the event used to identify what occurred.

- `payload`: `object`

  Payload containing information about the application that triggered the event.

  - `application`: `string`

    Name of the application that triggered the event.

### DeviceDidChange

Occurs when a Stream Deck device changed, for example its name or size.

Available from Stream Deck 7.0.

```ts
type DeviceDidChange = {
	device: string;
	deviceInfo: {
		name: string;
		size: {
			columns: number;
			rows: number;
		};
		type: DeviceType;
	};
	event: "deviceDidChange";
};
```

**Properties**

- `device`: `string`

  Unique identifier of the Stream Deck device that this event is associated with.

- `deviceInfo`: `DeviceInfo`

  Information about the device that changed.

  - `name`: `string`

    Name of the device, as specified by the user in the Stream Deck application.

  - `size`: `Size`

    Number of action slots, excluding dials / touchscreens, available to the device.

    - `columns`: `number`

      Number of columns available on the Stream Deck device.

    - `rows`: `number`

      Number of rows available on the Stream Deck device.

  - `type`: `DeviceType`

    Type of the device that was connected, e.g. Stream Deck +, Stream Deck Pedal, etc. See `DeviceType`.

- `event`: `"deviceDidChange"`

  Name of the event used to identify what occurred.

### DeviceDidConnect

Occurs when a Stream Deck device is connected. See also `DeviceDidDisconnect`.

```ts
type DeviceDidConnect = {
	device: string;
	deviceInfo: {
		name: string;
		size: {
			columns: number;
			rows: number;
		};
		type: DeviceType;
	};
	event: "deviceDidConnect";
};
```

**Properties**

- `device`: `string`

  Unique identifier of the Stream Deck device that this event is associated with.

- `deviceInfo`: `DeviceInfo`

  Information about the newly connected device.

  - `name`: `string`

    Name of the device, as specified by the user in the Stream Deck application.

  - `size`: `Size`

    Number of action slots, excluding dials / touchscreens, available to the device.

    - `columns`: `number`

      Number of columns available on the Stream Deck device.

    - `rows`: `number`

      Number of rows available on the Stream Deck device.

  - `type`: `DeviceType`

    Type of the device that was connected, e.g. Stream Deck +, Stream Deck Pedal, etc. See `DeviceType`.

- `event`: `"deviceDidConnect"`

  Name of the event used to identify what occurred.

### DeviceDidDisconnect

Occurs when a Stream Deck device is disconnected. See also `DeviceDidConnect`.

```ts
type DeviceDidDisconnect = {
	device: string;
	event: "deviceDidDisconnect";
};
```

**Properties**

- `device`: `string`

  Unique identifier of the Stream Deck device that this event is associated with.

- `event`: `"deviceDidDisconnect"`

  Name of the event used to identify what occurred.

### DialDown

Occurs when the user presses a dial (Stream Deck +). See also `DialUp`.

NB: For other action types see `KeyDown`.

```ts
type DialDown = {
	action: string;
	context: string;
	device: string;
	event: "dialDown";
	payload: {
		controller: "Encoder";
		coordinates: {
			column: number;
			row: number;
		};
		resources: {
			[key: string]: string;
		};
		settings: {
			[key: string]: JsonValue;
		};
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

- `event`: `"dialDown"`

  Name of the event used to identify what occurred.

- `payload`: `TPayload`

  Contextualized information for this event.

  - `controller`: `"Encoder"`

    Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
    or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

  - `coordinates`: `Coordinates`

    Coordinates that identify the location of the action.

    - `column`: `number`

      Column the action instance is located in, indexed from 0.

    - `row`: `number`

      Row the action instance is located on, indexed from 0.

      Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_
      be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.

  - `resources`: `Resources`

    Resources (files) associated with the action.

    Available from Stream Deck 7.1.

  - `settings`: `TSettings`

    Settings associated with the action instance.

### DialRotate

Occurs when the user rotates a dial (Stream Deck +).

```ts
type DialRotate = {
	action: string;
	context: string;
	device: string;
	event: "dialRotate";
	payload: {
		controller: "Encoder";
		coordinates: {
			column: number;
			row: number;
		};
		pressed: boolean;
		resources: {
			[key: string]: string;
		};
		settings: {
			[key: string]: JsonValue;
		};
		ticks: number;
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

- `event`: `"dialRotate"`

  Name of the event used to identify what occurred.

- `payload`: `TPayload`

  Contextualized information for this event.

  - `controller`: `"Encoder"`

    Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
    or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

  - `coordinates`: `Coordinates`

    Coordinates that identify the location of the action.

    - `column`: `number`

      Column the action instance is located in, indexed from 0.

    - `row`: `number`

      Row the action instance is located on, indexed from 0.

      Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_
      be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.

  - `pressed`: `boolean`

    Determines whether the dial was pressed whilst the rotation occurred.

  - `resources`: `Resources`

    Resources (files) associated with the action.

    Available from Stream Deck 7.1.

  - `settings`: `TSettings`

    Settings associated with the action instance.

  - `ticks`: `number`

    Number of ticks the dial was rotated; this can be a positive (clockwise) or negative (counter-clockwise) number.

### DialUp

Occurs when the user releases a pressed dial (Stream Deck +). See also `DialDown`.

NB: For other action types see `KeyUp`.

```ts
type DialUp = {
	action: string;
	context: string;
	device: string;
	event: "dialUp";
	payload: {
		controller: "Encoder";
		coordinates: {
			column: number;
			row: number;
		};
		resources: {
			[key: string]: string;
		};
		settings: {
			[key: string]: JsonValue;
		};
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

- `event`: `"dialUp"`

  Name of the event used to identify what occurred.

- `payload`: `TPayload`

  Contextualized information for this event.

  - `controller`: `"Encoder"`

    Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
    or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

  - `coordinates`: `Coordinates`

    Coordinates that identify the location of the action.

    - `column`: `number`

      Column the action instance is located in, indexed from 0.

    - `row`: `number`

      Row the action instance is located on, indexed from 0.

      Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_
      be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.

  - `resources`: `Resources`

    Resources (files) associated with the action.

    Available from Stream Deck 7.1.

  - `settings`: `TSettings`

    Settings associated with the action instance.

### DidReceiveDeepLink

Occurs when Stream Deck receives a deep-link message intended for the plugin. The message is re-routed to the plugin, and provided as part of the payload. One-way deep-link message
can be routed to the plugin using the URL format `streamdeck://plugins/message/<PLUGIN_UUID>/{MESSAGE}`.

```ts
type DidReceiveDeepLink = {
	event: "didReceiveDeepLink";
	payload: {
		url: string;
	};
};
```

**Properties**

- `event`: `"didReceiveDeepLink"`

  Name of the event used to identify what occurred.

- `payload`: `object`

  Payload containing information about the URL that triggered the event.

  - `url`: `string`

    The deep-link URL, with the prefix omitted.

### DidReceiveGlobalSettings

Occurs when the plugin receives the global settings from Stream Deck.

```ts
type DidReceiveGlobalSettings = {
	event: "didReceiveGlobalSettings";
	id?: string;
	payload: {
		settings: {
			[key: string]: JsonValue;
		};
	};
};
```

**Properties**

- `event`: `"didReceiveGlobalSettings"`

  Name of the event used to identify what occurred.

- `id`: `string` (optional)

  Identifier provided when requesting the settings, used to identify the source of the request.

  This is always undefined if the event is received because the settings were changed in the property inspector.

- `payload`: `object`

  Additional information about the event that occurred.

  - `settings`: `TSettings`

    Global settings associated with this plugin.

### DidReceivePropertyInspectorMessage

Occurs when a payload was received from the UI.

```ts
type DidReceivePropertyInspectorMessage = {
	action: string;
	context: string;
	event: "sendToPlugin";
	payload: JsonValue;
};
```

**Properties**

- `action`: `string`

  Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".

- `context`: `string`

  Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and
  request settings associated with the action instance, etc.

- `event`: `"sendToPlugin"`

  Name of the event used to identify what occurred.

- `payload`: `JsonValue`

  Contextualized information for this event.

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
				settings: {
					[key: string]: JsonValue;
				};
				state?: number;
		  }
		| {
				controller: Controller;
				coordinates: {
					column: number;
					row: number;
				};
				isInMultiAction: false;
				resources: {
					[key: string]: string;
				};
				settings: {
					[key: string]: JsonValue;
				};
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

  - MultiActionPayload

    - `controller`: `"Keypad"`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

      NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.

    - `isInMultiAction`: `true`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

  - SingleActionPayload

    - `controller`: `Controller`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

    - `coordinates`: `Coordinates`

      Coordinates that identify the location of an action.

      - `column`: `number`

        Column the action instance is located in, indexed from 0.

      - `row`: `number`

        Row the action instance is located on, indexed from 0.

        Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_
        be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.

    - `isInMultiAction`: `false`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

### DidReceiveSettings

Occurs when the settings associated with an action instance are requested, or when the settings
are updated in the property inspector.

```ts
type DidReceiveSettings = {
	action: string;
	context: string;
	device: string;
	event: "didReceiveSettings";
	id?: string;
	payload:
		| {
				controller: "Keypad";
				isInMultiAction: true;
				resources: {
					[key: string]: string;
				};
				settings: {
					[key: string]: JsonValue;
				};
				state?: number;
		  }
		| {
				controller: Controller;
				coordinates: {
					column: number;
					row: number;
				};
				isInMultiAction: false;
				resources: {
					[key: string]: string;
				};
				settings: {
					[key: string]: JsonValue;
				};
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

- `event`: `"didReceiveSettings"`

  Name of the event used to identify what occurred.

- `id`: `string` (optional)

  Identifier provided when requesting the settings, used to identify the source of the request.

  This is always undefined if the event is received because the settings were changed in the property
  inspector.

- `payload`: `MultiActionPayload | SingleActionPayload`

  Contextualized information for this event.

  One of:

  - MultiActionPayload

    - `controller`: `"Keypad"`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

      NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.

    - `isInMultiAction`: `true`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

  - SingleActionPayload

    - `controller`: `Controller`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

    - `coordinates`: `Coordinates`

      Coordinates that identify the location of an action.

      - `column`: `number`

        Column the action instance is located in, indexed from 0.

      - `row`: `number`

        Row the action instance is located on, indexed from 0.

        Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_
        be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.

    - `isInMultiAction`: `false`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

### KeyDown

Occurs when the user presses a action down. See also `KeyUp`.

NB: For dials / touchscreens see `DialDown`.

```ts
type KeyDown = {
	action: string;
	context: string;
	device: string;
	event: "keyDown";
	payload:
		| {
				controller: "Keypad";
				isInMultiAction: true;
				resources: {
					[key: string]: string;
				};
				settings: {
					[key: string]: JsonValue;
				};
				state?: number;
				userDesiredState: number;
		  }
		| {
				controller: "Keypad";
				coordinates: {
					column: number;
					row: number;
				};
				isInMultiAction: false;
				resources: {
					[key: string]: string;
				};
				settings: {
					[key: string]: JsonValue;
				};
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

- `event`: `"keyDown"`

  Name of the event used to identify what occurred.

- `payload`: `MultiActionKeyGesturePayload | SingleActionPayload`

  Contextualized information for this event.

  One of:

  - MultiActionKeyGesturePayload

    - `controller`: `"Keypad"`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

      NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.

    - `isInMultiAction`: `true`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

    - `userDesiredState`: `number`

      Desired state as specified by the user; only applicable to actions that have multiple states defined within the `manifest.json` file, and when this action instance is
      part of a multi-action.

  - SingleActionPayload

    - `controller`: `"Keypad"`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

    - `coordinates`: `Coordinates`

      Coordinates that identify the location of an action.

      - `column`: `number`

        Column the action instance is located in, indexed from 0.

      - `row`: `number`

        Row the action instance is located on, indexed from 0.

        Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_
        be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.

    - `isInMultiAction`: `false`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

### KeyUp

Occurs when the user releases a pressed action. See also `KeyDown`.

NB: For dials / touchscreens see `DialUp`.

```ts
type KeyUp = {
	action: string;
	context: string;
	device: string;
	event: "keyUp";
	payload:
		| {
				controller: "Keypad";
				isInMultiAction: true;
				resources: {
					[key: string]: string;
				};
				settings: {
					[key: string]: JsonValue;
				};
				state?: number;
				userDesiredState: number;
		  }
		| {
				controller: "Keypad";
				coordinates: {
					column: number;
					row: number;
				};
				isInMultiAction: false;
				resources: {
					[key: string]: string;
				};
				settings: {
					[key: string]: JsonValue;
				};
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

- `event`: `"keyUp"`

  Name of the event used to identify what occurred.

- `payload`: `MultiActionKeyGesturePayload | SingleActionPayload`

  Contextualized information for this event.

  One of:

  - MultiActionKeyGesturePayload

    - `controller`: `"Keypad"`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

      NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.

    - `isInMultiAction`: `true`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

    - `userDesiredState`: `number`

      Desired state as specified by the user; only applicable to actions that have multiple states defined within the `manifest.json` file, and when this action instance is
      part of a multi-action.

  - SingleActionPayload

    - `controller`: `"Keypad"`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

    - `coordinates`: `Coordinates`

      Coordinates that identify the location of an action.

      - `column`: `number`

        Column the action instance is located in, indexed from 0.

      - `row`: `number`

        Row the action instance is located on, indexed from 0.

        Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_
        be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.

    - `isInMultiAction`: `false`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

### PropertyInspectorDidAppear

Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. See also `PropertyInspectorDidDisappear`.

```ts
type PropertyInspectorDidAppear = {
	action: string;
	context: string;
	device: string;
	event: "propertyInspectorDidAppear";
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

- `event`: `"propertyInspectorDidAppear"`

  Name of the event used to identify what occurred.

### PropertyInspectorDidDisappear

Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. See also `PropertyInspectorDidAppear`.

```ts
type PropertyInspectorDidDisappear = {
	action: string;
	context: string;
	device: string;
	event: "propertyInspectorDidDisappear";
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

- `event`: `"propertyInspectorDidDisappear"`

  Name of the event used to identify what occurred.

### SystemDidWakeUp

Occurs when the computer wakes up.

```ts
type SystemDidWakeUp = {
	event: "systemDidWakeUp";
};
```

**Properties**

- `event`: `"systemDidWakeUp"`

  Name of the event used to identify what occurred.

### TitleParametersDidChange

Occurs when the user updates an action's title settings in the Stream Deck application.

```ts
type TitleParametersDidChange = {
	action: string;
	context: string;
	device: string;
	event: "titleParametersDidChange";
	payload: {
		controller: Controller;
		coordinates: {
			column: number;
			row: number;
		};
		resources: {
			[key: string]: string;
		};
		settings: {
			[key: string]: JsonValue;
		};
		state?: number;
		title: string;
		titleParameters: {
			fontFamily: string;
			fontSize: number;
			fontStyle: "" | "Bold Italic" | "Bold" | "Italic" | "Regular";
			fontUnderline: boolean;
			showTitle: boolean;
			titleAlignment: "bottom" | "middle" | "top";
			titleColor: string;
		};
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

- `event`: `"titleParametersDidChange"`

  Name of the event used to identify what occurred.

- `payload`: `TPayload`

  Contextualized information for this event.

  - `controller`: `Controller`

    Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
    or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

  - `coordinates`: `Coordinates`

    Coordinates that identify the location of an action.

    - `column`: `number`

      Column the action instance is located in, indexed from 0.

    - `row`: `number`

      Row the action instance is located on, indexed from 0.

      Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_
      be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.

  - `resources`: `Resources`

    Resources (files) associated with the action.

    Available from Stream Deck 7.1.

  - `settings`: `TSettings`

    Settings associated with the action instance.

  - `state`: `number` (optional)

    Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

  - `title`: `string`

    Title of the action, as specified by the user or dynamically by the plugin.

  - `titleParameters`: `object`

    Defines aesthetic properties that determine how the title should be rendered.

    - `fontFamily`: `string`

      Font-family the title will be rendered with.

    - `fontSize`: `number`

      Font-size the title will be rendered in.

    - `fontStyle`: `"" | "Bold Italic" | "Bold" | "Italic" | "Regular"`

      Typography of the title.

    - `fontUnderline`: `boolean`

      Determines whether the font should be underlined.

    - `showTitle`: `boolean`

      Determines whether the user has opted to show, or hide the title for this action instance.

    - `titleAlignment`: `"bottom" | "middle" | "top"`

      Alignment of the title.

    - `titleColor`: `string`

      Color of the title, represented as a hexadecimal value.

### TouchTap

Occurs when the user taps the touchscreen (Stream Deck +).

```ts
type TouchTap = {
	action: string;
	context: string;
	device: string;
	event: "touchTap";
	payload: {
		controller: "Encoder";
		coordinates: {
			column: number;
			row: number;
		};
		hold: boolean;
		resources: {
			[key: string]: string;
		};
		settings: {
			[key: string]: JsonValue;
		};
		tapPos: [x: number, y: number];
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

- `event`: `"touchTap"`

  Name of the event used to identify what occurred.

- `payload`: `TPayload`

  Contextualized information for this event.

  - `controller`: `"Encoder"`

    Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
    or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

  - `coordinates`: `Coordinates`

    Coordinates that identify the location of the action.

    - `column`: `number`

      Column the action instance is located in, indexed from 0.

    - `row`: `number`

      Row the action instance is located on, indexed from 0.

      Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_
      be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.

  - `hold`: `boolean`

    Determines whether the tap was considered "held".

  - `resources`: `Resources`

    Resources (files) associated with the action.

    Available from Stream Deck 7.1.

  - `settings`: `TSettings`

    Settings associated with the action instance.

  - `tapPos`: `[x: number, y: number]`

    Coordinates of where the touchscreen tap occurred, relative to the canvas of the action.

### WillAppear

Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
page". An action refers to _all_ types of actions, e.g. keys, dials, touchscreens, pedals, etc.

```ts
type WillAppear = {
	action: string;
	context: string;
	device: string;
	event: "willAppear";
	payload:
		| {
				controller: "Keypad";
				isInMultiAction: true;
				resources: {
					[key: string]: string;
				};
				settings: {
					[key: string]: JsonValue;
				};
				state?: number;
		  }
		| {
				controller: Controller;
				coordinates: {
					column: number;
					row: number;
				};
				isInMultiAction: false;
				resources: {
					[key: string]: string;
				};
				settings: {
					[key: string]: JsonValue;
				};
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

- `event`: `"willAppear"`

  Name of the event used to identify what occurred.

- `payload`: `MultiActionPayload | SingleActionPayload`

  Contextualized information for this event.

  One of:

  - MultiActionPayload

    - `controller`: `"Keypad"`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

      NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.

    - `isInMultiAction`: `true`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

  - SingleActionPayload

    - `controller`: `Controller`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

    - `coordinates`: `Coordinates`

      Coordinates that identify the location of an action.

      - `column`: `number`

        Column the action instance is located in, indexed from 0.

      - `row`: `number`

        Row the action instance is located on, indexed from 0.

        Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_
        be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.

    - `isInMultiAction`: `false`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

### WillDisappear

Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys, dials,
touchscreens, pedals, etc.

```ts
type WillDisappear = {
	action: string;
	context: string;
	device: string;
	event: "willDisappear";
	payload:
		| {
				controller: "Keypad";
				isInMultiAction: true;
				resources: {
					[key: string]: string;
				};
				settings: {
					[key: string]: JsonValue;
				};
				state?: number;
		  }
		| {
				controller: Controller;
				coordinates: {
					column: number;
					row: number;
				};
				isInMultiAction: false;
				resources: {
					[key: string]: string;
				};
				settings: {
					[key: string]: JsonValue;
				};
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

- `event`: `"willDisappear"`

  Name of the event used to identify what occurred.

- `payload`: `MultiActionPayload | SingleActionPayload`

  Contextualized information for this event.

  One of:

  - MultiActionPayload

    - `controller`: `"Keypad"`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

      NB: Requires Stream Deck 6.5 for `WillAppear` and `WillDisappear` events.

    - `isInMultiAction`: `true`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

  - SingleActionPayload

    - `controller`: `Controller`

      Defines the controller type the action is applicable to. **Keypad** refers to a standard action on a Stream Deck device, e.g. 1 of the 15 buttons on the Stream Deck MK.2,
      or a pedal on the Stream Deck Pedal, etc., whereas an **Encoder** refers to a dial / touchscreen on the Stream Deck +.

    - `coordinates`: `Coordinates`

      Coordinates that identify the location of an action.

      - `column`: `number`

        Column the action instance is located in, indexed from 0.

      - `row`: `number`

        Row the action instance is located on, indexed from 0.

        Note: When the device is Stream Deck +, the row can be 0 for keys (`Keypad`), and will _always_
        be 0 for dials (`Encoder`); to differentiate between actions types, cross-check the `controller`.

    - `isInMultiAction`: `false`

      Determines whether the action is part of a multi-action.

      NB. Requires Stream Deck 6.7 when accessed from the property inspector.

    - `resources`: `Resources`

      Resources (files) associated with the action.

      Available from Stream Deck 7.1.

    - `settings`: `TSettings`

      Settings associated with the action instance.

    - `state`: `number` (optional)

      Current state of the action; only applicable to actions that have multiple states defined within the `manifest.json` file.

## Commands

Plugins can send the following commands to Stream Deck via their WebSocket connection.

### GetGlobalSettings

Gets the global settings associated with the plugin. Causes `DidReceiveGlobalSettings` to be emitted.

```ts
type GetGlobalSettings = {
	context: string;
	event: "getGlobalSettings";
	id?: string;
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"getGlobalSettings"`

  Name of the command, used to identify the request.

- `id`: `string` (optional)

  Optional identifier that can be used to identify the response to this request.

### GetResources

Gets the resources (files) associated with the action; these resources are embedded into the action
when it is exported, either individually, or as part of a profile.

Available from Stream Deck 7.1.

```ts
type GetResources = {
	context: string;
	event: "getResources";
	id?: string;
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"getResources"`

  Name of the command, used to identify the request.

- `id`: `string` (optional)

  Optional identifier that can be used to identify the response to this request.

### GetSettings

Gets the settings associated with an instance of an action. Causes `DidReceiveSettings` to be emitted.

```ts
type GetSettings = {
	context: string;
	event: "getSettings";
	id?: string;
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"getSettings"`

  Name of the command, used to identify the request.

- `id`: `string` (optional)

  Optional identifier that can be used to identify the response to this request.

### LogMessage

Logs a message to the file-system.

```ts
type LogMessage = {
	event: "logMessage";
	payload: {
		message: string;
	};
};
```

**Properties**

- `event`: `"logMessage"`

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

  - `message`: `string`

    Message to log.

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

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

  - `url`: `string`

    URL to open.

### SendToPropertyInspector

Sends a message to the property inspector.

```ts
type SendToPropertyInspector = {
	context: string;
	event: "sendToPropertyInspector";
	payload: JsonValue;
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"sendToPropertyInspector"`

  Name of the command, used to identify the request.

- `payload`: `JsonValue`

  Additional information supplied as part of the command.

### SetFeedback

Set's the feedback of an existing layout associated with an action instance.

```ts
type SetFeedback = {
	context: string;
	event: "setFeedback";
	payload: {
		[string]:
			| string
			| number
			| {
					[string]: schemas.Bar;
			  }
			| {
					[string]: schemas.GBar;
			  }
			| {
					[string]: schemas.Pixmap;
			  }
			| {
					[string]: schemas.Text;
			  };
	};
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"setFeedback"`

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

### SetFeedbackLayout

Sets the layout associated with an action instance.

```ts
type SetFeedbackLayout = {
	context: string;
	event: "setFeedbackLayout";
	payload: {
		layout: string;
	};
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"setFeedbackLayout"`

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

  - `layout`: `string`

    Name of a pre-defined layout, or relative path to a custom one.

### SetGlobalSettings

Sets the global settings associated with the plugin.

```ts
type SetGlobalSettings = {
	context: string;
	event: "setGlobalSettings";
	payload: {
		[key: string]: JsonValue;
	};
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"setGlobalSettings"`

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

### SetImage

Sets the image associated with an action instance.

```ts
type SetImage = {
	context: string;
	event: "setImage";
	payload: {
		image?: string;
		state?: number;
		target?: Target;
	};
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"setImage"`

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

  - `image`: `string` (optional)

    Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),

  - `state`: `number` (optional)

    Action state the command applies to; when no state is supplied, the image is set for both states. **Note**, only applies to multi-state actions.

  - `target`: `Target` (optional)

    Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.

### SetResources

Sets the resources (files) associated with the action; these resources are embedded into the action
when it is exported, either individually, or as part of a profile.

Available from Stream Deck 7.1.

```ts
type SetResources = {
	context: string;
	event: "setResources";
	payload: {
		[key: string]: string;
	};
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"setResources"`

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

### SetSettings

Sets the settings associated with an instance of an action.

```ts
type SetSettings = {
	context: string;
	event: "setSettings";
	payload: {
		[key: string]: JsonValue;
	};
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"setSettings"`

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

### SetState

Sets the current state of an action instance.

```ts
type SetState = {
	context: string;
	event: "setState";
	payload: {
		state: number;
	};
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"setState"`

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

  - `state`: `number`

    State to set; this be either 0, or 1.

### SetTitle

Sets the title displayed for an instance of an action.

```ts
type SetTitle = {
	context: string;
	event: "setTitle";
	payload: {
		state?: number;
		target?: Target;
		title?: string;
	};
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"setTitle"`

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

  - `state`: `number` (optional)

    Action state the request applies to; when no state is supplied, the title is set for both states. **Note**, only applies to multi-state actions.

  - `target`: `Target` (optional)

    Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.

  - `title`: `string` (optional)

    Title to display; when no title is specified, the title will reset to the title set by the user.

### SetTriggerDescription

Sets the trigger descriptions associated with an encoder action instance.

```ts
type SetTriggerDescription = {
	context: string;
	event: "setTriggerDescription";
	payload: {
		longTouch?: string;
		push?: string;
		rotate?: string;
		touch?: string;
	};
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"setTriggerDescription"`

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

  - `longTouch`: `string` (optional)

    Touchscreen "long-touch" interaction behavior description; when `undefined`, the description will not be shown.

  - `push`: `string` (optional)

    Dial "push" (press) interaction behavior description; when `undefined`, the description will not be shown.

  - `rotate`: `string` (optional)

    Dial rotation interaction behavior description; when `undefined`, the description will not be shown.

  - `touch`: `string` (optional)

    Touchscreen "touch" interaction behavior description; when `undefined`, the description will not be shown.

### ShowAlert

Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on the action instance. Used to provide visual feedback when an action failed.

```ts
type ShowAlert = {
	context: string;
	event: "showAlert";
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"showAlert"`

  Name of the command, used to identify the request.

### ShowOk

Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on the action instance. Used to provide visual feedback when an action successfully executed.

```ts
type ShowOk = {
	context: string;
	event: "showOk";
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `event`: `"showOk"`

  Name of the command, used to identify the request.

### SwitchToProfile

Switches to the profile, as distributed by the plugin, on the specified device.

NB: Plugins may only switch to profiles distributed with the plugin, as defined within the manifest, and cannot access user-defined profiles.

```ts
type SwitchToProfile = {
	context: string;
	device: string;
	event: "switchToProfile";
	payload: {
		page?: number;
		profile?: string;
	};
};
```

**Properties**

- `context`: `string`

  Defines the context of the command, e.g. which action instance the command is intended for.

- `device`: `string`

  Unique identifier of the device where the profile should be set.

- `event`: `"switchToProfile"`

  Name of the command, used to identify the request.

- `payload`: `TPayload`

  Additional information supplied as part of the command.

  - `page`: `number` (optional)

    Optional page to show when switching to the profile, indexed from 0. When `undefined`, the
    page that was previously visible (when switching away from the profile will be made visible.

  - `profile`: `string` (optional)

    Name of the profile to switch to; the name must be identical to the one provided in the manifest.

    When not specified, Stream Deck will switch to the previous profile.
