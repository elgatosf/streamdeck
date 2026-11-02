# @streamdeck/core

Types and enums used to create Stream Deck plugins.

> [!IMPORTANT]
> Most plugin authors should use [`@elgato/streamdeck`](../plugin/), the official Node.js SDK for creating Stream Deck plugins. It re-exports the commonly used types and enums from this package, and provides the functionality required to connect to, and communicate with, Stream Deck. Use `@streamdeck/core` directly only when you require the protocol types in isolation, e.g. when building tooling.

## Installation

```bash
pnpm add @streamdeck/core
```

## Exports Overview

- **Requests:** types for events the plugin sends to Stream Deck, e.g. `SetGlobalSettings`, `SetSettings`, and `SetImage`.
- **Events/responses:** types for events Stream Deck sends to the plugin, e.g. `WillAppear`, `KeyDown`, and `DeviceDidConnect`.
- **Devices:** `DeviceType`, `DeviceInfo`, and `Size`.
- **Actions:** supporting types such as `Coordinates`, `State`, `Target`, and `Resources`.
- **Layouts:** types and enums for feedback on Stream Deck +, Stream Deck + XL, and Stream Deck Neo, e.g. `FeedbackPayload`, `Bar`, and `BarSubType`.
- **Registration:** `RegistrationInfo` and `RegistrationParameter`, used to establish a connection with Stream Deck, and `ActionInfo` for the property inspector.
- **Localization:** `Language` and `supportedLanguages`.
