import streamDeck, { action, type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.hello-world.counter" })
class Counter extends SingletonAction {
	/**
	 * Occurs when the user presses the key action.
	 */
	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
		// Set the actions settings on key down.
		// [!code highlight:4]
		await ev.action.setSettings({
			count: 1,
		});
	}
}

streamDeck.actions.registerAction(new Counter());
streamDeck.connect();
