import streamDeck from "@elgato/streamdeck";

streamDeck.system.onDidReceiveDeepLink((ev) => {
	// Set the global settings after receiving a deep-link.
	streamDeck.settings.setGlobalSettings({
		messageReceived: true,
	});
});

streamDeck.connect();
