import streamDeck from "@elgato/streamdeck";

streamDeck.system.onDidReceiveDeepLink(async (ev) => {
	// Get the settings.
	const settings = await streamDeck.settings.getGlobalSettings();
});

streamDeck.connect();
