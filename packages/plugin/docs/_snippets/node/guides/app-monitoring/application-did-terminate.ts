import streamDeck, { ApplicationDidTerminateEvent } from "@elgato/streamdeck";

streamDeck.system.onApplicationDidTerminate((ev: ApplicationDidTerminateEvent) => {
	// Handle a registered application terminating.
	streamDeck.logger.info(ev.application); // e.g. "Elgato Wave Link.exe"
});
