---
sidebar_label: "Changes"
sidebar_position: 3
---

# Web Socket API Changes

Learn more about changes related to building Stream Deck plugins using the Web Socket API.

## Stream Deck

<a id="stream-deck-7-6-0"></a>

### v7.6.0

- Added support for Neo Infobar actions, [learn more](https://docs.elgato.com/streamdeck/sdk/guides/neo-infobar).
- Actions within the manifest now support `Neo` as a [controller](../manifest.md#action-controllers).

<a id="stream-deck-7-1-0"></a>

### v7.1.0

- Added support for [embedding resources](./plugin.md#setresources) within actions.
- Added support for Node.js 24, configurable within the [manifest](../manifest.md#nodejs-version).
- Added in-app developer tools that track the current property inspector.
- Fixed device type mapping for Stream Deck Scissor Keys and Corsair keyboards.

<a id="stream-deck-7-0-0"></a>

### v7.0.0

- Added `deviceDidChange` event.
  - Occurs when a devices' metadata or size changes.
  - [Learn more](./plugin.md#devicedidchange) about listening to device changes.
- Added support for passive deep-link messages using the `?streamdeck=hidden` query parameter.
  - Passive deep-links messages will not bring Stream Deck to the foreground.
  - [Learn more](../../guides/deep-linking.md#active-vs-passive) about active vs passive deep-link message.
- Added `SupportedInKeyLogicActions` property to actions within the manifest.
  - When `false`, the action will not be usable within Key Logic actions.
  - Optional property; default is `true`.
- Added device type for Virtual Stream Deck (11).
- Updated device `size` to reflect the visual size of the device.
  - Previously always 8 x 8 for Stream Deck Mobile and Virtual Stream Deck.
- Fixed an issue whereby linked plugins would not run on first launch after installing Stream Deck.

<a id="stream-deck-6-9-0"></a>

### v6.9.0

- Added `SupportURL` option to the manifest:
  - When specified, users will see a help button above the property inspector of the selected action.
  - Specifying a `SupportURL` at the [root level](../manifest.md#manifest-supporturl) (plugin) will apply to all actions.
  - Specifying a `SupportURL` at the [action level](../manifest.md#action-supporturl) will override the plugin `SupportURL`.
  - `SupportURL` values are optional, but recommended.
- Added device type for Stream Deck Studio.
- Improved parsing of URLs when receiving deep-link messages, to support empty segments.
- Resolved an issue whereby updating a layout item's `zOrder` to the same value would result in an error.
- Updated Node.js runtime to v20.19.0.
- Updated Chromium to v122.0.6261.171.

<a id="stream-deck-6-7-0"></a>

### v6.7.0

- Added `isInMultiAction` to property inspector action information.
- Updated Node.js runtime to v20.15.0
- Updated Chromium to v118.0.5993.220.

<a id="stream-deck-6-6-0"></a>

### v6.6.0

- Added support for Stream Deck Neo, and SCUF controllers.
- Added support for OS-specific actions via `Actions[].OS` within the manifest.
- Added the ability to disable automatically installing pre-defined profiles, when a plugin is installed, via `Profiles[].AutoInstall` within the manifest.

<a id="stream-deck-6-5-0"></a>

### v6.5.0

> [!WARNING]
> Please note, from Stream Deck 6.5 onwards, `dialPress` will not be emitted by the API. Plugins should use `dialDown` and `dialUp` to receive events relating to dial presses.

- Added support for receiving deep-link messages.
- Added support for switching to a specific profile page when calling `switchToProfile`.
- Added `controller` information to `WillAppear` and `WillDisappear` events for multi-actions.
- Added support for Node.js plugins with the `.cjs` or `.mjs` file extensions.
- Removed `dialPress` event in favour of `dialDown` and `dialUp`.
- Updated Node.js runtime to v20.8.1.

<a id="stream-deck-6-4-0"></a>

### v6.4.0

- Added support for Node.js plugins (beta).
- Added `DisableAutomaticStates` option to manifest.
- Added `setTriggerDescription` command for Stream Deck + encoders.
- Added `range` to BAR layout item.
- Added `range` to GBAR layout item.
- Added `text-overflow` to TEXT layout item.
- Deprecated support for installing plugins using the `streamdeck://` scheme.

<a id="stream-deck-6-1-0"></a>

### v6.1.0

- Add `dialDown` event for Stream Deck + encoders.
- Add `dialUp` event for Stream Deck + encoders.
- Deprecated `dialPress` event for Stream Deck + encoders.

<a id="stream-deck-6-0-0"></a>

### v6.0.0

- Add support for Stream Deck +.
- Add `UserTitleEnabled` property to the manifest.
- Add `Encoder` to the manifest for Stream Deck + devices.
- Add `TriggerDescription` to the manifest for Stream Deck + devices.
- Add `Layouts` for Stream Deck + displays.
- Add `setFeedback` event for Stream Deck + displays.
- Add `setFeedbackLayout` event for Stream Deck + displays.
- Add `touchTap` event for Stream Deck + displays.
- Add `dialPress` event for Stream Deck + encoders.
- Add `dialRotate` event for Stream Deck + encoders.
- Update `willAppear` and `willDisappear` events to include the `controller` property.

## Archive

<details>
<summary>Stream Deck v5</summary>

**v5.3.0**

- Add support for Corsair Voyager.

**v5.2.0**

- Add support for Stream Deck Pedal.

**v5.0.0**

- Add support for SVG icons.
- Update property inspector to receive `didReceiveGlobalSettings` when `setGlobalSettings` is called from the plugin.
- Update information parameter to include operating system information.

</details>

<details>
<summary>Stream Deck v4</summary>

**v4.8.0**

- You can now specify in the `setImage` event on which state the image should be set. This change only applies to actions with two states. If no state is specified, the image is set to both states.
- You can now specify in the `setTitle` event on which state the title should be set. This change only applies to actions with two states. If no state is specified, the title is set to both states.

**v4.7.0**

- Add support for Corsair G Keys.

**v4.6.0**

- Update `switchToProfile` command to work with editable pre-configured profile.

**v4.5.1**

- Update `setImage` command to accept SVG images.

**v4.3.3**

- Add `DontAutoSwitchWhenInstalled` option in the `manifest.json`; when `true`, Stream Deck will not automatically switch to the pre-configured profile that was installed.

**v4.3.0**

- Add support for Stream Deck XL.
- Add support for Stream Deck Mobile.
- Add `systemDidWakeUp` event when computer wakes from sleep.
- Update image rendering to always prefer user defined images.
- Update `deviceDidConnect` event to include device name.

**v4.2.0**

- Update `willAppear` and `willDisappear` events to be sent inside Multi-Actions.
- Update `switchToProfile` command to temporarily disable Smart Profile switching.
- Update `switchToProfile` command to prompt the user to install the profile, if it is not installed.
- Update Smart Profile switching so that it is disabled whilst Stream Deck is open.
- Update information parameter to include plugin version.

</details>

<!--

## 4.1.0

We introduced some changes to the SDK that make new plugins not backward compatible with Stream Deck 4.0.x. New plugins should only target Stream Deck 4.1 and later.

### New property SDKVersion

The manifest.json file should now contain an `SDKVersion` property. The value should be set to 2 for new plugins: `"SDKVersion": 2`. Plugins with the `SDKVersion` property will only run in Stream Deck 4.1 and later. New plugins should not support Stream Deck 4.0.x anymore and should contain in their manifest.json file the following:

```json
"Software": {
 "MinimumVersion" : "4.1"
}
```

More information about the manifest.json file can be read in the `Manifest documentation`

---

#### connectSocket() has been renamed to connectElgatoStreamDeckSocket() <a href="#connectsocket-has-been-renamed-to-connectelgatostreamdecksocket" id="connectsocket-has-been-renamed-to-connectelgatostreamdecksocket"></a>

The registration function for the plugin and Property Inspector has been renamed from `connectSocket()` to `connectElgatoStreamDeckSocket()`.

More information can be read in the `Registration Procedure`

---

#### Simplified communication between the plugin and Property Inspector <a href="#simplified-communication-between-the-plugin-and-property-inspector" id="simplified-communication-between-the-plugin-and-property-inspector"></a>

Several changes have been made to simplify the communication between the plugin and the Property Inspector:

- The `setSettings` API can be used from the Property Inspector to save persistent data for the action's instance.
- When the `setSettings` API is called from the plugin, the Property Inspector will automatically receive a `didReceiveSettings` callback with the new settings.
- Similarly when the `setSettings` API is called from the Property Inspector, the plugin will automatically receive a `didReceiveSettings` callback with the new settings.
- A new `getSettings` API has been introduced and can be used from the plugin and Property Inspector. After calling this API, the plugin or Property Inspector will receive asynchronously an event `didReceiveSettings` containing the settings for the action.
- When the Property Inspector is displayed, the settings are passed directly to the Property Inspector in the inActionInfo parameter. With this change, the Property Inspector gets right away the current settings for the action.
- When the Property Inspector is displayed, the plugin will receive a new `propertyInspectorDidAppear` event.
- When the Property Inspector is dismissed, the plugin will receive a new `propertyInspectorDidDisappear` event.

---

### Possibility to save global settings

The plugin and Property Inspector can now save persistent data globally and not just to one instance of an action using the new `setGlobalSettings` API. The data will be saved per plugin and securely. This new API can be used to save, for example, tokens that should be available to all the actions of the plugin.

Note that when the plugin uses `setGlobalSettings`, the Property Inspector will automatically receive a `didReceiveGlobalSettings` callback with the new global settings. Similarly when the Property Inspector uses this API, the plugin will automatically receive a `didReceiveGlobalSettings` callback.

A new `getGlobalSettings` API has also been introduced and can be used from the plugin and Property Inspector. After calling this API, the plugin or Property Inspector will receive asynchronously an event `didReceiveGlobalSettings` containing the global settings.

---

### Logging

The plugin and Property Inspector can use the new `logMessage` event to write a debug message to the logs file:

```json
{
	"event": "logMessage",
	"payload": {
		"message": "Hello World!"
	}
}
```

Logs are saved to disk per plugin in the folder `~/Library/Logs/StreamDeck/` on macOS and `%appdata%\Elgato\StreamDeck\logs\` on Windows. Note that the log files are rotated each time the Stream Deck app is relaunched.

---

### Possibility to open a new window

The Property Inspector and a Javascript plugin can now open a new window. The main html file could contain a callback function like this:

```javascript
function gotCallbackFromWindow(parameter) {
	console.log(parameter);
}
```

When a `keyDown` event occurs, the plugin can open the `new_window.html` in a new window:

```javascript
if (event == "keyDown") {
	window.open("new_window.html");
}
```

The `new_window.html` file will call the callback:

```html
<!doctype html>
<html>
	<head>
		<title>My New Window</title>
		<meta charset="utf-8" />
	</head>

	<body>
		<script type="text/javascript">
			window.opener.gotCallbackFromWindow("Hello World");
			//window.close();
		</script>
	</body>
</html>
```

Windows opened have a default size of 500 x 650 px. You can change this size by setting the `DefaultWindowSize` property in the manifest.json, for example:

```json
"DefaultWindowSize": [200, 300],
```

---

### devicePixelRatio

The `info` parameter received by the `connectElgatoStreamDeckSocket()` function of the plugin and Property Inspector now contains a `devicePixelRatio` value. This can be used to know if the Stream Deck app is running on a HiDPI screen. Example:

```json
{
	"application": {
		"language": "en",
		"platform": "mac",
		"version": "4.1.0"
	},
	"devicePixelRatio": 2,
	"devices": [
		{
			"id": "CDE8FC2CAD244599CE37A45A8D78FFF0",
			"size": {
				"columns": 5,
				"rows": 3
			},
			"type": 0
		}
	]
}
```

---

### Other improvements

- You can now reload a Javascript plugin or the Property Inspector using CMD-R in the Chrome Remote Debugger.
- The working directory for a compiled plugin is now set to the plugin folder
- The filter in open dialogs was not working properly under certain circumstances
- Javascript plugins can now access the clipboard
- Improvements on how the plugins are terminated

-->
