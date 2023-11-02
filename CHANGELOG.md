<!--

## {version}

🚨 Breaking change
✨ Add
🐞 Fix
♻️ Refactor / Enhance / Update

-->

# Change Log

## 0.2.0 (Pending)

### Breaking Changes

-   ✨ Add `system` namespace; the following have been relocated from `streamDeck.client` to `streamDeck.system`:
    -   `onApplicationDidLaunch`
    -   `onApplicationDidTerminate`
    -   `onSystemDidWakeUp`
    -   `openUrl`

### New

## 0.1.0

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
