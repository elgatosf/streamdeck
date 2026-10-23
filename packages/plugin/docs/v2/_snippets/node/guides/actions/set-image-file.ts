import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

/**
 * Example action that updates the key action image from a file.
 */
@action({ UUID: "com.elgato.hello-world.increment" })
export class IncrementCounter extends SingletonAction {
	/**
	 * Occurs when the user presses the key action.
	 */
	override onKeyDown(ev: KeyDownEvent) {
		// [!code highlight:2]
		ev.action.setImage("imgs/actions/counter/key.png"); // image path
	}
}
