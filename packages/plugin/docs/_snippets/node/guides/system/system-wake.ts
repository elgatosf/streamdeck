import streamDeck from "@elgato/streamdeck";

streamDeck.system.onSystemDidWakeUp((ev) => {
	// Handle system wake.
});

streamDeck.connect();
