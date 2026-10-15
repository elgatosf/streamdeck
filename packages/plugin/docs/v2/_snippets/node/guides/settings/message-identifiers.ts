import streamDeck from "@elgato/streamdeck";

// [!code highlight:3]
// Only call onDidReceive[Global]Settings when settings change.
streamDeck.settings.useExperimentalMessageIdentifiers = true;

// ...

streamDeck.connect();
