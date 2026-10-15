import { action, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.test.one" })
export class IncrementCounter extends SingletonAction {
	/**
	 * Occurs when the action will appear.
	 */
	override onWillAppear(ev: WillAppearEvent): Promise<void> {
		if (ev.action.isDial()) {
			return ev.action.setFeedbackLayout("custom-layout.json"); // [!code highlight]
		}
	}
}
