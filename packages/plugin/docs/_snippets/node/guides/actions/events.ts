import streamDeck, { action, type KeyDownEvent, SingletonAction, type WillAppearEvent } from "@elgato/streamdeck";

/**
 * An action that logs a key press.
 */
@action({ UUID: "com.elgato.hello-world.log" })
export class LogKeyPressAction extends SingletonAction {
	/**
	 * Handles the action appearing on the canvas.
	 * @param ev Information about the event.
	 */
	override onWillAppear(ev: WillAppearEvent): void | Promise<void> {
		ev.action; // instance of the action the event is for.
		ev.action.device; // device information.
		ev.payload.controller; // type of the action, i.e. key, or dial & touchscreen.

		// etc.
	}

	/**
	 * Handles the user pressing a Stream Deck key (pedal, G-key, etc).
	 * @param ev Information about the event.
	 */
	override onKeyDown(ev: KeyDownEvent): void | Promise<void> {
		streamDeck.logger.info(`Key pressed!`);
	}
}
