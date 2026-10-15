import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

/**
 * Example Discord Mute action.
 */
@action({ UUID: "com.discord.mute" })
export class Mute extends SingletonAction {
	/**
	 * Occurs when the user presses the key action.
	 */
	override onKeyDown(ev: KeyDownEvent) {
		if (ev.payload.isInMultiAction) {
			// We can access the user's desired state via...
			ev.payload.userDesiredState; // [!code highlight]
		}
	}
}
