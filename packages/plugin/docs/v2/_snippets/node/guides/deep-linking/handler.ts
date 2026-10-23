import streamDeck from "@elgato/streamdeck";

streamDeck.system.onDidReceiveDeepLink((ev) => {
	// Handle the deep-link message
});

streamDeck.connect();
