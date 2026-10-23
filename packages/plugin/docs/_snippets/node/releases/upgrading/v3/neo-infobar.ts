import { action, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.example.neo-infobar" })
export class ExampleNeoInfobarAction extends SingletonAction {
	/**
	 * Occurs when the action appears.
	 */
	override async onWillAppear(ev: WillAppearEvent): Promise<void> {
		if (ev.action.isNeoInfobar()) {
			// Set the layout.
			await ev.action.setFeedbackLayout("layout.json");
			await ev.action.setFeedback({
				img: "logo",
				text: "Hello world",
			});
		}
	}
}
