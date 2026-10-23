import streamDeck from "@elgato/streamdeck";

streamDeck.actions.onKeyDown(() => {
	streamDeck.system.openUrl("https://elgato.com");
});

streamDeck.connect();
