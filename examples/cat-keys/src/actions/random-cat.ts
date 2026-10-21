import streamDeck, {
	action,
	KeyAction,
	KeyUpEvent,
	SingletonAction,
	WillAppearEvent,
	WillDisappearEvent,
} from '@elgato/streamdeck';

const FIFTEEN_MINUTES = 15 * 60 * 1000;

/**
 * An example action class that displays a random cat.
 */
@action({ UUID: 'com.elgato.cat-keys.random-cat' })
export class RandomCat extends SingletonAction<RandomCatSettings> {
	private timer: NodeJS.Timeout | undefined;

	/**
	 * Sets the initial action image, stores the action for auto-updating, and establishes a timer for auto-updating.
	 */
	override onWillAppear(ev: WillAppearEvent<RandomCatSettings>): void {
		// Verify that the action is a key so we can call setRandomCat.
		if (!ev.action.isKey()) return;

		// Set a random cat image when the key appears.
		this.setRandomCat(ev.action);

		if (!this.timer) {
			this.timer = setInterval(() => {
				for (const action of this.actions) {
					// Verify that the action is a key so we can call setRandomCat.
					if (action.isKey()) {
						action.getSettings().then((settings) => {
							if (settings.autoUpdate) {
								this.setRandomCat(action);
							}
						});
					}
				}
			}, FIFTEEN_MINUTES);
		}
	}

	/**
	 * Removes the action from the auto-update list (as it is no longer visible) and clears the timer if no more actions are auto-updating.
	 */
	override async onWillDisappear(ev: WillDisappearEvent<RandomCatSettings>): Promise<void> {
		if (this.actions.next().done) {
			clearInterval(this.timer);
			this.timer = undefined;
		}
	}

	/**
	 * Sets a new random cat image when the key is pressed.
	 */
	override onKeyUp(ev: KeyUpEvent<RandomCatSettings>): void | Promise<void> {
		this.setRandomCat(ev.action);
	}

	/**
	 * Fetches a random cat image and sets it as the action's image.
	 * @param action The action in which to apply the new cat image.
	 */
	private async setRandomCat(action: KeyAction) {
		try {
			const response = await fetch('https://cataas.com/cat?width=144&height=144');
			const buffer = await response.arrayBuffer();
			const data = Buffer.from(buffer).toString('base64');
			const image = `data:image/png;base64,${data}`;

			action.setImage(image);
		} catch (e) {
			streamDeck.logger.error('Failed to fetch random cat image:', e);
		}
	}
}

/**
 * Settings for {@link RandomCat}.
 */
type RandomCatSettings = {
	autoUpdate: boolean;
};
