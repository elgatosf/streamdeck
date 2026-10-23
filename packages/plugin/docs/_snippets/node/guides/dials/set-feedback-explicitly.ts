import { action, DialUpEvent, SingletonAction } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.layout-image-test.increment" })
export class IncrementCounter extends SingletonAction<CounterSettings> {
	/**
	 * Occurs when the user releases a dial.
	 */
	override async onDialUp(ev: DialUpEvent<CounterSettings>): Promise<void> {
		await ev.action.setFeedback({
			indicator: {
				value: 50, // [!code highlight]
				range: {
					min: 0,
					max: 100,
				},
			},
		});
	}
}

/**
 * Settings for {@link IncrementCounter}.
 */
type CounterSettings = {
	count?: number;
	incrementBy?: number;
};
