import streamDeck, { action, type DidReceiveSettingsEvent, SingletonAction } from "@elgato/streamdeck";

// Define the action's settings type.
type Settings = {
	count: number;
};

@action({ UUID: "com.elgato.hello-world.counter" })
class Counter extends SingletonAction<Settings> {
	/**
	 * Occurs when the application-layer receives the settings from the UI.
	 */
	// [!code highlight:4]
	override onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): void {
		// Action settings changed in the UI
	}
}

streamDeck.actions.registerAction(new Counter());
streamDeck.connect();
