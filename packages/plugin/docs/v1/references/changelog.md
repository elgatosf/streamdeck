---
sidebar_label: "Changes"
sidebar_position: 3
---

# Stream Deck Changes

Learn more about changes related to building Stream Deck plugins.

## Stream Deck

<a id="stream-deck-7-6-0"></a>

### v7.6.0

- Added support for Neo Infobar actions, [learn more](https://docs.elgato.com/streamdeck/sdk/guides/neo-infobar).
- Actions within the manifest now support `Neo` as a [controller](./manifest.md#action-controllers).

<a id="stream-deck-7-1-0"></a>

### v7.1.0

- Added support for [embedding resources](https://docs.elgato.com/streamdeck/sdk/guides/resources) within actions.
- Added support for Node.js 24, configurable within the [manifest](./manifest.md#nodejs-version).
- Added in-app developer tools that track the current property inspector.
- Fixed device type mapping for Stream Deck Scissor Keys and Corsair keyboards.

<a id="stream-deck-7-0-0"></a>

### v7.0.0

- Added `streamDeck.devices.onDeviceDidChange` event.
  - Occurs when a devices' metadata or size changes.
  - [Learn more](../guides/devices.md#changing) about listening to device changes.
- Added support for passive deep-link messages using the `?streamdeck=hidden` query parameter.
  - Passive deep-links messages will not bring Stream Deck to the foreground.
  - [Learn more](../guides/deep-linking.md#active-vs-passive) about active vs passive deep-link message.
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
  - Specifying a `SupportURL` at the [root level](./manifest.md#manifest-supporturl) (plugin) will apply to all actions.
  - Specifying a `SupportURL` at the [action level](./manifest.md#action-supporturl) will override the plugin `SupportURL`.
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
