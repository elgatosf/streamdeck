# Change Log

## 0.5.0

### Minor Changes

- Added support for Neo Infobar layout sizes.

## 0.4.15

### Patch Changes

- Added Stream Deck 7.4.

## 0.4.14

### Patch Changes

- Added Stream Deck 7.3.
- Added `Galleon100SD` device type and manifest hint.
- Added `StreamDeckPlusXL` device type and manifest hint.

## 0.4.13

### Patch Changes

- Fixed release pipeline.

## 0.4.12

### Patch Changes

- Added Stream Deck 7.2.

## 0.4.11

### Patch Changes

- `Nodejs` is now correctly marked as optional in older version.

## 0.4.10

### Patch Changes

- Added Stream Deck 7.1.
- Added support for Node.js 24.

## 0.4.9

### Patch Changes

- Updated recommended `SDKVersion`.

## 0.4.8

### Patch Changes

- Added `Actions[].SupportedInKeyLogicActions`.

## 0.4.7

### Patch Changes

- Added Stream Deck 7.0.
- Added `VirtualStreamDeck` device type and manifest hint.

## 0.4.6

### Patch Changes

- Fixed documentation for `Icon` size requirements.

## 0.4.5

### Patch Changes

- Added `StreamDeckStudio` device type and manifest hint.

## 0.4.4

### Patch Changes

- Added `SupportURL` and `Actions[].SupportURL`.

## 0.4.3

### Patch Changes

- Added Stream Deck 6.9.

## 0.4.2

### Patch Changes

- Updated iconography color guide.
- Updated dependencies.

## 0.4.1

### Patch Changes

- Updated manifest `Profiles[].AutoInstall` to reflect minimum Stream Deck version.
- Updated manifest `Icon` to remove Marketplace reference.

## 0.4.0

### Minor Changes

- Fixed package exports.

## 0.3.9

### Patch Changes

- RemovedSVG reference from `Icon` documentation.

## 0.3.8

### Patch Changes

- Fixed `Icon` incorrectly allowing SVG images.

## 0.3.7

### Patch Changes

- Added Stream Deck 6.8.

## 0.3.6

### Patch Changes

- Added Stream Deck 6.7.

## 0.3.5

### Patch Changes

- Added `@elgato/schemas/streamdeck/plugins/json` export.

## 0.3.4

### Patch Changes

- Fixed `Version` format documentation.

## 0.3.3

### Patch Changes

- Fixed patterns for `CategoryIcon`, `Icon`, `PropertyInspectorPath`, and `UUID`.
- Fixed patterns for `CodePath`, `CodePathMac`, and `CodePathWin`.
- Fixed patterns for an action's `Icon`, `PropertyInspectorPath`, and `UUID`.
- Fixed patterns for an encoder's `Icon`, `background`, and `layout`.
- Fixed patterns for a state's `Image`, and `MultiActionImage`.
- Fixed pattern for a profile's `Name`.

## 0.3.2

### Patch Changes

- `Actions[].States` can now contain more than 2 states.

## 0.3.1

### Patch Changes

- Fixed missing `MinimumVersion` values.

## 0.3.0

### Minor Changes

- Renamed SCUF device type to `SCUFController`.

## 0.2.2

### Patch Changes

- Added `ScufGamepad` and `StreamDeckNeo` device hints to manifest documentation.

## 0.2.1

### Patch Changes

- Added `ScufGamepad` and `StreamDeckNeo` device types.

## 0.2.0

### Minor Changes

- Added `Profiles[].AutoInstall`, introduced in Stream Deck 6.6.
- Removed`$schema` property from TypeScript types.

## 0.1.8

### Patch Changes

- Version fix.

## 0.1.7

### Patch Changes

- Updated `Version` to require a major, minor, patch, and build numbers.
- Prevent `Version` from having leading zeroes, for example `1.002.3.4`; non-leading zeroes are still permitted.

## 0.1.6

### Patch Changes

- Added `Actions[].OS`, introduced in Stream Deck 6.6.

## 0.1.5

### Patch Changes

- Schemas are now accessible directly under the Elgato domain.
    - [Manifest schema](https://schemas.elgato.com/streamdeck/plugins/manifest.json)
    - [Layout schema](https://schemas.elgato.com/streamdeck/plugins/layout.json)

## 0.1.4

### Patch Changes

- Loosen rules on `Version` within manifest to allow more types; valid formats are now `{major}`, `{major}.{minor}`, `{major}.{minor}.{patch}`, and `{major}.{minor}.{patch}.{build}`.

## 0.1.3

### Patch Changes

- Added support for CommonJS.

## 0.1.2

### Patch Changes

- Fixed pattern for identifiers (action and plugin UUIDs).

## 0.1.1

### Patch Changes

- Added `imageDimensions` schema type.

## 0.1.0

### Minor Changes

- Added JSON schema for Stream Deck plugin's manifest.
- Added TypeScript declaration for Stream Deck plugin's manifest.
- Added JSON schema for Stream Deck plugin's layout.
- Added TypeScript declaration for Stream Deck plugin's layout.
- Added custom keyword definitions.
