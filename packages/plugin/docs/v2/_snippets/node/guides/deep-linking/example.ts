import streamDeck from "@elgato/streamdeck";

streamDeck.system.onDidReceiveDeepLink((ev) => {
	const { path, fragment } = ev.url;

	streamDeck.logger.info(`Path = ${path}`);
	streamDeck.logger.info(`Fragment = ${fragment}`);
});

streamDeck.connect();
