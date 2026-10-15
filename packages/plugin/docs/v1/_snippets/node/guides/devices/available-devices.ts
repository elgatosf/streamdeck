import streamDeck from "@elgato/streamdeck";

streamDeck.devices.forEach((device) => {
	const { id, isConnected, name, size, type } = device;

	streamDeck.logger.info(name); // Stream Deck Neo, Stream Deck +
});
