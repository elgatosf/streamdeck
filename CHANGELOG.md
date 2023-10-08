<!--

## {version}

🚨 Breaking change
✨ Add
🐞 Fix
♻️ Refactor / Enhance / Update

-->

# Change Log

## 0.1.0-beta.2 (Pending)

### Breaking

-   🚨 Update `setTitle` function signature; `title` is now required, and `state` and `target` are now a single optional `options` parameter.

## 0.1.0-beta.1

### New

-   ✨ Add support for `range` as part of `bar` and `gbar` elements in layouts.
-   ✨ Add support for `text-overflow` as part of `text` elements in layouts.

### Fixes

-   🐞 Fixed routed actions having un-typed settings.

### Miscellaneous

-   ♻️ Update JSON schemas for layouts to support `range` and `text-overflow`.
-   ♻️ Refactor payload settings to more accurately reflect specified settings.
-   ♻️ Result of evaluating debug mode is now cached to improve the performance of subsequent calls.
-   ♻️ Default localizations now read from the in-memory manifest to reduce disk I/O.

## 0.1.0-beta.0

### New

-   ✨ Add Stream Deck communication client (see `streamDeck.client`).
-   ✨ Add support for receiving all events (Stream Deck 6.4).
-   ✨ Add support for sending all commands (Stream Deck 6.4).
-   ✨ Add action routing (see `streamDeck.actions`).
-   ✨ Add centralized device information tracking (see `streamDeck.devices`).
-   ✨ Add local file-based logging framework (see `streamDeck.logger`).
-   ✨ Add localization support (see `streamDeck.i18n`).
-   ✨ Add manifest information (see `streamDeck.manifest`).
-   ✨ Add Stream Deck and plugin information (see `streamDeck.info`).
