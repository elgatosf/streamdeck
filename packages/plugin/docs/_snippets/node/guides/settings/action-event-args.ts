import streamDeck, { action, type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

// Define the action's settings type.
type Settings = {
	count: number;
};

@action({ UUID: "com.elgato.hello-world.counter" })
class Counter extends SingletonAction<Settings> {
	/**
	 * Occurs when the user presses the key action.
	 */
	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		// Read the current count.
		let { count = 0 } = ev.payload.settings; // [!code highlight]
		count++;

		// Set the new count.
		await ev.action.setSettings({ count });
	}
}

streamDeck.actions.registerAction(new Counter());
streamDeck.connect();
