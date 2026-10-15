import streamDeck from "@elgato/streamdeck";

// Define the action's settings type.
type Settings = {
	count: number;
};

streamDeck.settings.onDidReceiveSettings<Settings>((ev) => {
	// Handle the settings changing in the application layer.
});
