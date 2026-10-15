import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.hello-world.increment" })
export class IncrementCounter extends SingletonAction<CounterSettings> {
	/**
	 * Occurs when the action will appear.
	 */
	override async onWillAppear(ev: WillAppearEvent<CounterSettings>): Promise<void> {
		if (ev.action.isKey() || ev.action.isDial()) {
			await ev.action.setTitle(`${ev.payload.settings.count ?? 0}`);
		}
	}

	/**
	 * Occurs when the action's key is pressed down.
	 */
	override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
		// Determine the current count from the settings.
		let count = ev.payload.settings.count ?? 0;
		if (count === 0) {
			count = 1;
		} else if (count < 256) {
			count = count * 2;
		} else {
			count = 0;
		}

		// Update the current count in the action's settings, and change the title.
		await ev.action.setSettings({ count });
		await ev.action.setTitle(`${count}`);
	}
}

type CounterSettings = {
	count: number;
};
