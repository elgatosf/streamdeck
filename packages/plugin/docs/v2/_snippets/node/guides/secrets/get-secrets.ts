import streamDeck from "@elgato/streamdeck";

// [!code highlight:3]
const secrets = await streamDeck.system.getSecrets<Secrets>();
secrets.apiKey; // 1479fa141ddf47438710afb3f45b75be

type Secrets = {
	apiKey: string;
};
