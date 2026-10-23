import streamDeck from "@elgato/streamdeck";

// Define a type that represents the settings.
type Settings = {
	count: number;
};

streamDeck.system.onDidReceiveDeepLink(async (ev) => {
	// When getting the settings, supply the type.
	let { count = 0 } = await streamDeck.settings.getGlobalSettings<Settings>();

	count++;
	await streamDeck.settings.setGlobalSettings({ count });
});

streamDeck.connect();
