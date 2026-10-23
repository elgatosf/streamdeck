import streamDeck, { ApplicationDidLaunchEvent } from "@elgato/streamdeck";

streamDeck.system.onApplicationDidLaunch((ev: ApplicationDidLaunchEvent) => {
	// Handle a registered application launching
	streamDeck.logger.info(ev.application); // e.g. "Elgato Wave Link.exe"
});
