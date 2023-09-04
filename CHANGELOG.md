<!--

## {version}

🚨 Breaking change
✨ Add
🐞 Fix
♻️ Refactor / Enhance / Update

-->

# Change Log

## 0.2.0-beta.0 (Pending)

### Fixes

-   🐞 Fixed routed actions having un-typed settings.

### Miscellaneous

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
