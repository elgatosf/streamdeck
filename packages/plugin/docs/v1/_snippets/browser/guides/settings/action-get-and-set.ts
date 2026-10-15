import streamDeck from "@elgato/streamdeck";

// Define the action's settings type.
type Settings = {
	count: number;
};

// When the HTML button is pressed, increment the count by 1.
document.querySelector("button").addEventListener("click", async (ev) => {
	let { count = 0 } = await streamDeck.settings.getSettings<Settings>();
	count++;

	streamDeck.settings.setSettings({ count });
});
