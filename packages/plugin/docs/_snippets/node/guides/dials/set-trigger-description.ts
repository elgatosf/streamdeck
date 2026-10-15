import { action, DialUpEvent, SingletonAction } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.trigger-description-example.increment" })
export class IncrementCounter extends SingletonAction<CounterSettings> {
	/**
	 * Occurs when the user releases a dial.
	 */
	override async onDialUp(ev: DialUpEvent<CounterSettings>): Promise<void> {
		// [!code highlight:7]
		await ev.action.setTriggerDescription({
			push: "Increment counter",
			rotate: "Adjust increment",
			touch: "Increment counter",
			longTouch: "Reset counter",
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
