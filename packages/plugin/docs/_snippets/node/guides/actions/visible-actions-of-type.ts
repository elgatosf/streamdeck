import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

/**
 * Example of accessing the visible actions of a specific action type.
 */
@action({ UUID: "com.elgato.hello-world.increment" })
export class IncrementCounter extends SingletonAction {
	/**
	 * Occurs when the user presses the key.
	 */
	override onKeyDown(ev: KeyDownEvent) {
		// Iterate over visible actions with the UUID "com.elgato.hello-world.increment".
		// [!code highlight:5]
		this.actions.forEach((action) => {
			if (action.isKey() || action.isDial()) {
				action.setTitle("Hello world!");
			}
		});
	}
}
