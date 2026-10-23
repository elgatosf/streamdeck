import { action, KeyDownEvent, SingletonAction, Target } from "@elgato/streamdeck";

/**
 * Example action that updates the key action image with additional options.
 */
@action({ UUID: "com.elgato.hello-world.increment" })
export class IncrementCounter extends SingletonAction {
	/**
	 * Occurs when the user presses the key action.
	 */
	override onKeyDown(ev: KeyDownEvent) {
		// [!code highlight:5]
		ev.action.setImage("imgs/actions/counter/key.png", {
			target: Target.HardwareAndSoftware,
			state: 1,
		});
	}
}
