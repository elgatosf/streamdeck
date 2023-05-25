import streamDeck, { KeyDownEvent, LogLevel, WillAppearEvent } from "@elgato/streamdeck";

// Trace logs all messages between the Stream Deck and the plugin; as we aren't using sensitive information, this is fine.
streamDeck.logger.setLogLevel(LogLevel.TRACE);

// Register a key down event handler that will increment the counter each time it is pressed.
streamDeck.on("keyDown", async ({ context, payload: { settings } }: KeyDownEvent<CounterSettings>) => {
	if (settings.count === undefined) {
		settings.count = 1;
	} else {
		settings.count++;
	}

	streamDeck.setTitle(context, settings.count.toString());
	streamDeck.setSettings(context, settings);
});

// When a button appears, set the title to the current count.
streamDeck.on("willAppear", async ({ context, payload: { settings } }: WillAppearEvent<CounterSettings>) => {
	streamDeck.setTitle(context, (settings.count ?? 0).toString());
});

// Settings for the counter action.
type CounterSettings = {
	count?: number;
};
