import { type KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

type Settings = {
	name: string;
};

export class MyAction extends SingletonAction<Settings> {
	/**
	 * Occurs when the user presses the key action.
	 */
	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		/*
		 * Even though the settings are typed, if they have not
		 * been previously set, their values will be undefined.
		 */
		const { name } = await ev.action.getSettings();
		// [!code highlight:2]
		name.toLowerCase(); // Runtime error!
	}
}
