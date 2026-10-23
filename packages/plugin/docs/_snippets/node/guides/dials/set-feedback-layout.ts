import { action, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.test.one" })
export class IncrementCounter extends SingletonAction {
	/**
	 * Occurs when the action will appear.
	 */
	override async onWillAppear(ev: WillAppearEvent): Promise<void> {
		if (ev.action.isDial()) {
			// Specify built-in layout name (e.g. "$B1"), or path to the custom layout file.
			await ev.action.setFeedbackLayout("custom-layout.json"); // [!code highlight]
		}
	}
}
