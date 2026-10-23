import { action, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.example.neo-infobar" })
export class NeoInfobarExampleAction extends SingletonAction {
	/**
	 * Occurs when the action appears.
	 */
	override async onWillAppear(ev: WillAppearEvent): Promise<void> {
		if (ev.action.isNeoInfobar()) {
			// Set the layout.
			await ev.action.setFeedbackLayout("layout.json");

			// Set the layout item values.
			await ev.action.setFeedback({
				title: {
					opacity: 0.5,
					color: "#FF0000",
					value: "Hello world", // [!code highlight]
				},
			});
		}
	}
}
