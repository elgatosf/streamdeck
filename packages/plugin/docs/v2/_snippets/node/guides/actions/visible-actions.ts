import streamDeck from "@elgato/streamdeck";

// Iterate over all of your plugin's visible actions.
// [!code highlight:4]
streamDeck.actions.forEach((action) => {
	action.setTitle("Hello world");
});
