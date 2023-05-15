// This currently requires npm link whilst we develop.
import streamDeck from "@elgato/streamdeck";

streamDeck.on("didReceiveSettings", (msg) => {
	console.log(msg.event);
});
