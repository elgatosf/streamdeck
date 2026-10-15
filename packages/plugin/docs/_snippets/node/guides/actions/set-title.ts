import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

/**
 * Example action that updates the title.
 */
@action({ UUID: "com.elgato.hello-world.increment" })
export class IncrementCounter extends SingletonAction {
	/**
	 * Occurs when the user presses the key action.
	 */
	override onKeyDown(ev: KeyDownEvent) {
		ev.action.setTitle("Hello world!"); // [!code highlight]
	}
}
