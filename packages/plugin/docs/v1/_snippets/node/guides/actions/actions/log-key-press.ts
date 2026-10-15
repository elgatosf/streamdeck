import streamDeck, { action, type JsonObject, type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

/**
 * An action that logs a Stream Deck key press.
 */
@action({ UUID: "com.elgato.hello-world.log" })
export class LogKeyPressAction extends SingletonAction {
	/**
	 * Handles the user pressing a Stream Deck key (pedal, G-key, etc).
	 * @param ev Information about the event.
	 */
	override onKeyDown(ev: KeyDownEvent<JsonObject>): void | Promise<void> {
		streamDeck.logger.info(`Key pressed!`);
	}
}
