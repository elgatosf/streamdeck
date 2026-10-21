import { action, DialRotateEvent, SingletonAction } from '@elgato/streamdeck';

/**
 * An example action class that demonstrates switching the encoder's touch display layout.
 */
@action({ UUID: 'com.elgato.layouts.built-in-layout' })
export class BuiltInLayout extends SingletonAction {
	/**
	 * Switch the layout and update the title based on the dial rotation.
	 */
	override onDialRotate(ev: DialRotateEvent<DialSettings>): Promise<void> | void {
		let { value = 0 } = ev.payload.settings;
		const { ticks } = ev.payload;
		const adjustment = ticks > 0 ? 1 : -1;

		value = Math.max(0, Math.min(5, value + adjustment));

		switch (value) {
			case 0:
				ev.action.setFeedbackLayout('$X1');
				ev.action.setFeedback({ title: 'Layout $X1' });
				break;
			case 1:
				ev.action.setFeedbackLayout('$A0');
				ev.action.setFeedback({
					title: 'Layout $A0',
					'full-canvas': { background: 'blue' },
					canvas: { background: '#FFFFFF' },
				});
				break;
			case 2:
				ev.action.setFeedbackLayout('$A1');
				ev.action.setFeedback({ title: 'Layout $A1', value: '9000' });
				break;
			case 3:
				ev.action.setFeedbackLayout('$B1');
				ev.action.setFeedback({
					title: 'Layout $B1',
					value: '50',
					indicator: { value: '50' },
				});
				break;
			case 4:
				ev.action.setFeedbackLayout('$B2');
				ev.action.setFeedback({
					title: 'Layout $B2',
					value: '50',
					indicator: {
						value: '50',
						bar_bg_c: '0:#ffffff,0.33:#000a98,0.66:#ffffff,1:#000a98',
					},
				});
				break;
			case 5:
				ev.action.setFeedbackLayout('$C1');
				ev.action.setFeedback({
					title: 'Layout $C1',
					icon1: { value: 'imgs/actions/layout/layout.svg' },
					icon2: { value: 'imgs/actions/layout/layout.svg' },
					indicator1: { value: 25 },
					indicator2: { value: 75 },
				});
				break;
		}

		ev.action.setSettings({ value });
	}
}

/**
 * Settings for {@link BuiltInLayout}.
 */
type DialSettings = {
	value: number;
};
