import streamDeck, { type ActionInfo } from "@elgato/streamdeck";

// Define the type of the action's settings.
type Settings = {};

streamDeck.onConnected((_, action: ActionInfo<Settings>) => {
	// Use the settings to load the UI.
	streamDeck.logger.info(action.payload.settings);
});
