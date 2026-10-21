import { action, KeyDownEvent, KeyUpEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

/**
 * Persistent settings used by {@link IncrementCounter}.
 */
type CounterSettings = {
	/** Current counter value shown on the key. */
	count?: number;
	/** Amount to increment the counter by on each press. */
	incrementBy?: number;
};

/**
 * Stream Deck action that increments a counter on tap and resets it on long press.
 */
@action({ UUID: "com.elgato.counter.action" })
export class IncrementCounter extends SingletonAction<CounterSettings> {
	/** Tracks per-action press state to avoid cross-key races. */
	private pressState = new Map<string, AbortController>();

	/**
	 * Updates the key title when the action appears.
	 */
	override async onWillAppear(ev: WillAppearEvent<CounterSettings>): Promise<void> {
		await ev.action.setTitle(`${ev.payload.settings.count ?? 0}`);
	}

	/**
	 * Starts a timer to detect a long press. A short press is handled on key up once the timer is cancelled.
	 */
	override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
		// Start the timeout.
		const timeoutId = setTimeout(() => {
			this.pressState.delete(ev.action.id);
			ev.action.setTitle("0");
			ev.action.setSettings({ ...ev.payload.settings, count: 0 });
		}, 1500);

		// Create the abort controller that cancels the timeout and cleans up
		const controller = new AbortController();
		controller.signal.addEventListener(
			"abort",
			() => {
				this.pressState.delete(ev.action.id);
				clearTimeout(timeoutId);
			},
			{ once: true },
		);

		// Set the press state for the action
		this.pressState.set(ev.action.id, controller);
	}

	/**
	 * Cancels the long-press timer and increments the counter only if the key was released before the long press completed.
	 */
	override async onKeyUp(ev: KeyUpEvent<CounterSettings>): Promise<void> {
		const controller = this.pressState.get(ev.action.id);
		if (!controller) {
			return;
		}

		controller.abort();

		const settings = { ...ev.payload.settings };
		settings.incrementBy ??= 1;
		settings.count = (settings.count ?? 0) + settings.incrementBy;

		await ev.action.setSettings(settings);
		await ev.action.setTitle(`${settings.count}`);
	}
}
