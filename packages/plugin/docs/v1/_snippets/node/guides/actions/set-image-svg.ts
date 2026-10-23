import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

/**
 * Example action that updates the key action image from an SVG on key press.
 */
@action({ UUID: "com.elgato.hello-world.increment" })
export class IncrementCounter extends SingletonAction {
	/**
	 * Occurs when the user presses the key action.
	 */
	override onKeyDown(ev: KeyDownEvent<CounterSettings>) {
		const { count } = ev.payload.settings;
		const isRed = count % 2 === 0;
		const svg = `<svg width="100" height="100">
						<circle fill="${isRed ? "red" : "blue"}" r="45" cx="50" cy="50" ></circle>
					</svg>`;

		ev.action.setImage(`data:image/svg+xml,${encodeURIComponent(svg)}`); // [!code highlight]
		ev.action.setSettings({ count: count + 1 });
	}
}

type CounterSettings = {
	count: number;
};
