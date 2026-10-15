import { action, KeyDownEvent, SingletonAction, Target } from "@elgato/streamdeck";

/**
 * Example action that updates the title.
 */
@action({ UUID: "com.elgato.hello-world.increment" })
export class IncrementCounter extends SingletonAction {
	/**
	 * Occurs when the user presses the key action.
	 */
	override onKeyDown(ev: KeyDownEvent) {
		// [!code highlight:5]
		ev.action.setTitle("Hello world!", {
			state: 0,
			target: Target.Hardware,
		});
	}
}
