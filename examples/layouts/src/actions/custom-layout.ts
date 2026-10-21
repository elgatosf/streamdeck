import { action, DialRotateEvent, SingletonAction } from '@elgato/streamdeck';

/**
 * An example action class that demonstrates switching the encoder's touch display layout.
 */
@action({ UUID: 'com.elgato.layouts.custom-layout' })
export class CustomLayout extends SingletonAction {
	/**
	 * Switch the layout and update values based on the dial rotation.
	 */
	override async onDialRotate(ev: DialRotateEvent<DialSettings>): Promise<void> {
		let { value = 0 } = ev.payload.settings;
		const { ticks } = ev.payload;
		const adjustment = ticks > 0 ? 1 : -1;

		value = Math.max(0, Math.min(3, value + adjustment));

		switch (value) {
			case 0:
				await ev.action.setFeedbackLayout('layouts/custom-layout-1.json');
				await ev.action.setFeedback({ title: 'Custom Layout 1' });
				break;
			case 1:
				await ev.action.setFeedbackLayout('layouts/custom-layout-2.json');
				await ev.action.setFeedback({ 'my-image': 'imgs/actions/custom-layout/doggo.png' });

				break;
			case 2:
				await ev.action.setFeedbackLayout('layouts/custom-layout-3.json');
				await ev.action.setFeedback({
					battery: {
						value: 50,
					},
					icon2: {
						value: 'imgs/actions/custom-layout/battery.svg',
					},
					icon: {
						value: 'imgs/actions/custom-layout/controller.svg',
					},
					percent: {
						value: '50%',
					},
				});
				break;
			case 3:
				await ev.action.setFeedbackLayout('layouts/custom-layout-4.json');
				await ev.action.setFeedback({
					icon1: { value: 'imgs/actions/custom-layout/battery.svg' },
					icon2: { value: 'imgs/actions/custom-layout/controller.svg' },
					icon3: { value: 'imgs/actions/custom-layout/custom-layout.svg' },
				});
				break;
		}

		await ev.action.setSettings({ value });
	}
}

/**
 * Settings for {@link CustomLayout}.
 */
type DialSettings = {
	value: number;
};
