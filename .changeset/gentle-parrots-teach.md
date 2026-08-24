---
"@elgato/streamdeck": major
---

Updated `onDidReceiveSettings` and `onDidReceiveGlobalSettings` to only fire when settings are changed in the property inspector (requires Stream Deck 7.1 or higher). This behavior can be temporarily reverted by configuring `streamDeck.settings.useLegacySettingsBehavior` to be `true`.
