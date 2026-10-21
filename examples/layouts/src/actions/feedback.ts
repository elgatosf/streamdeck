import { action, DialRotateEvent, SingletonAction, WillAppearEvent } from '@elgato/streamdeck';

/**
 * An example action class that demonstrates updating the encoder's touch display layout values.
 */
@action({ UUID: 'com.elgato.layouts.feedback' })
export class Feedback extends SingletonAction {
	/**
	 * Sets the initial value when the action appears on Stream Deck.
	 */
	override onWillAppear(ev: WillAppearEvent<DialSettings>): Promise<void> | void {
		// Verify that the action is a dial so we can call setFeedback.
		if (!ev.action.isDial()) return;

		let { value = 50 } = ev.payload.settings;

		ev.action.setFeedback({ value, indicator: { value } });
		ev.action.setSettings({ value });
	}

	/**
	 * Update the value based on the dial rotation.
	 */
	override onDialRotate(ev: DialRotateEvent<DialSettings>): Promise<void> | void {
		let { value = 50 } = ev.payload.settings;
		const { ticks } = ev.payload;

		value = Math.max(0, Math.min(100, value + ticks));

		ev.action.setFeedback({ value, indicator: { value } });
		ev.action.setSettings({ value });
	}
}

/**
 * Settings for {@link Feedback}.
 */
type DialSettings = {
	value: number;
};
