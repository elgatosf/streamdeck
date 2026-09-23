<!--

## {version}

⚠️ Breaking change
✨ New
🐞 Fix
♻️ Refactor / Enhance / Update

-->

# Change Log

## 0.5.0

- Add support for Neo Infobar layout sizes.

## 0.4.15

- Add Stream Deck 7.4.

## 0.4.14

### ✨ New

- Add Stream Deck 7.3.
- Add `Galleon100SD` device type and manifest hint.
- Add `StreamDeckPlusXL` device type and manifest hint.

## 0.4.13

### 🐞 Fix

- Fix release pipeline.

## 0.4.12

### ✨ New

- Add Stream Deck 7.2.

## 0.4.11

### 🐞 Fix

- `Nodejs` is now correctly marked as optional in older version.

## 0.4.10

### ✨ New

- Add Stream Deck 7.1.
- Add support for Node.js 24.

## 0.4.9

### ♻️ Update

- Update recommended `SDKVersion`.

## 0.4.8

### ✨ New

- Add `Actions[].SupportedInKeyLogicActions`.

## 0.4.7

### ✨ New

- Add Stream Deck 7.0.
- Add `VirtualStreamDeck` device type and manifest hint.

## 0.4.6

### 🐞 Fix

- Fix documentation for `Icon` size requirements.

## 0.4.5

### ✨ New

- Add `StreamDeckStudio` device type and manifest hint.

## 0.4.4

### ✨ New

- Add `SupportURL` and `Actions[].SupportURL`.

## 0.4.3

### ✨ New

- Add Stream Deck 6.9.

## 0.4.2

### ♻️ Update

- Update iconography color guide.
- Update dependencies.

## 0.4.1

### ♻️ Update

- Update manifest `Profiles[].AutoInstall` to reflect minimum Stream Deck version.
- Update manifest `Icon` to remove Marketplace reference.

## 0.4.0

### 🐞 Fix

- Fix package exports.

## 0.3.9

### ♻️ Changed

- Remove SVG reference from `Icon` documentation.

## 0.3.8

### 🐞 Fix

- Fix `Icon` incorrectly allowing SVG images.

## 0.3.7

### ✨ New

- Add Stream Deck 6.8.

## 0.3.6

### ✨ New

- Add Stream Deck 6.7.

## 0.3.5

### ✨ New

- Add `@elgato/schemas/streamdeck/plugins/json` export.

## 0.3.4

### 🐞 Fix

- Fix `Version` format documentation.

## 0.3.3

### 🐞 Fix

- Fix patterns for `CategoryIcon`, `Icon`, `PropertyInspectorPath`, and `UUID`.
- Fix patterns for `CodePath`, `CodePathMac`, and `CodePathWin`.
- Fix patterns for an action's `Icon`, `PropertyInspectorPath`, and `UUID`.
- Fix patterns for an encoder's `Icon`, `background`, and `layout`.
- Fix patterns for a state's `Image`, and `MultiActionImage`.
- Fix pattern for a profile's `Name`.

## 0.3.2

### ♻️ Changed

- `Actions[].States` can now contain more than 2 states.

## 0.3.1

### 🐞 Fix

- Fix missing `MinimumVersion` values.

## 0.3.0

### ♻️ Changed

- Renamed SCUF device type to `SCUFController`.

## 0.3.0

### ♻️ Changed

- Renamed SCUF device type to `SCUFController`.

## 0.2.2

### ✨ New

- Add `ScufGamepad` and `StreamDeckNeo` device hints to manifest documentation.

## 0.2.1

### ✨ New

- Add `ScufGamepad` and `StreamDeckNeo` device types.

## 0.2.0

### ✨ New

- Add `Profiles[].AutoInstall`, introduced in Stream Deck 6.6.

### ⚠️ Breaking

- Remove `$schema` property from TypeScript types.

## 0.1.8

### 🐞 Fix

- Version fix.

## 0.1.7

### 🐞 Fix

- Update `Version` to require a major, minor, patch, and build numbers.
- Prevent `Version` from having leading zeroes, for example `1.002.3.4`; non-leading zeroes are still permitted.

## 0.1.6

### ✨ New

- Add `Actions[].OS`, introduced in Stream Deck 6.6.

## 0.1.5

### ✨ New

- Schemas are now accessible directly under the Elgato domain.
    - [Manifest schema](https://schemas.elgato.com/streamdeck/plugins/manifest.json)
    - [Layout schema](https://schemas.elgato.com/streamdeck/plugins/layout.json)

## 0.1.4

### 🐞 Fix

- Loosen rules on `Version` within manifest to allow more types; valid formats are now `{major}`, `{major}.{minor}`, `{major}.{minor}.{patch}`, and `{major}.{minor}.{patch}.{build}`.

## 0.1.3

### ✨ New

- Add support for CommonJS.

## 0.1.2

### 🐞 Fix

- Fix pattern for identifiers (action and plugin UUIDs).

## 0.1.1

### ✨ New

- Add `imageDimensions` schema type.

## 0.1.0

### ✨ New

- Add JSON schema for Stream Deck plugin's manifest.
- Add TypeScript declaration for Stream Deck plugin's manifest.
- Add JSON schema for Stream Deck plugin's layout.
- Add TypeScript declaration for Stream Deck plugin's layout.
- Add custom keyword definitions.
