import streamDeck from "@elgato/streamdeck";

streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
	// Global settings changed in the UI
});
