import streamDeck, { action, type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

// [!code highlight:5]
// Define the action's settings type.
type Settings = {
	count: number;
};

@action({ UUID: "com.elgato.hello-world.counter" })
// [!code highlight:2]
class Counter extends SingletonAction<Settings> {
	/**
	 * Occurs when the user presses the key action.
	 */
	// [!code highlight:2]
	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		// `ev.payload.settings` now contains typed-settings.

		// Set the actions settings on key down.
		await ev.action.setSettings({
			count: 1,
		});
	}
}

streamDeck.actions.registerAction(new Counter());
streamDeck.connect();
