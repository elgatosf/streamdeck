import streamDeck from "@elgato/streamdeck";

streamDeck.settings.onDidReceiveGlobalSettings((ev) => {
	// Handle the global settings changing in application layer.
});
