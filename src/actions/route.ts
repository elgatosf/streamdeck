import { StreamDeckClient } from "../client";
import { Action } from "./action";
import { SingletonAction } from "./singleton-action";

/**
 * Provides information about a route for an action.
 */
export class Route {
	/**
	 * Initializes a new instance of the {@link Route} class.
	 * @param client The Stream Deck client.
	 * @param action The action that will receive the events.
	 */
	constructor(private readonly client: StreamDeckClient, private readonly action: SingletonAction) {
		if (action.manifestId === undefined) {
			throw new Error("The action's manifestId cannot be undefined.");
		}

		this.addEventListener(action.manifestId, this.client.onDialDown, this.action.onDialDown);
		this.addEventListener(action.manifestId, this.client.onDialUp, this.action.onDialUp);
		this.addEventListener(action.manifestId, this.client.onDialRotate, this.action.onDialRotate);
		this.addEventListener(action.manifestId, this.client.onDidReceiveSettings, this.action.onDidReceiveSettings);
		this.addEventListener(action.manifestId, this.client.onKeyDown, this.action.onKeyDown);
		this.addEventListener(action.manifestId, this.client.onKeyUp, this.action.onKeyUp);
		this.addEventListener(action.manifestId, this.client.onPropertyInspectorDidAppear, this.action.onPropertyInspectorDidAppear);
		this.addEventListener(action.manifestId, this.client.onPropertyInspectorDidDisappear, this.action.onPropertyInspectorDidDisappear);
		this.addEventListener(action.manifestId, this.client.onSendToPlugin, this.action.onSendToPlugin);
		this.addEventListener(action.manifestId, this.client.onTitleParametersDidChange, this.action.onTitleParametersDidChange);
		this.addEventListener(action.manifestId, this.client.onTouchTap, this.action.onTouchTap);
		this.addEventListener(action.manifestId, this.client.onWillAppear, this.action.onWillAppear);
		this.addEventListener(action.manifestId, this.client.onWillDisappear, this.action.onWillDisappear);
	}

	/**
	 * Registers the specified {@link listener} against the {@link event}; the listener is only invoked when the event is associated with the specified {@link manifestId}.
	 * @param manifestId Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`), e.g. "com.elgato.wave-link.mute".
	 * @param event Event to listen for.
	 * @param listener The listener that will be invoked when the `event` occurs.
	 */
	private addEventListener<TEventArgs extends RoutingEvent>(
		manifestId: string,
		event: (listener: (ev: TEventArgs) => void) => void,
		listener: ((ev: TEventArgs) => Promise<void> | void) | undefined
	) {
		const boundedListener = listener?.bind(this.action);
		if (boundedListener === undefined) {
			return;
		}

		event.bind(this.client)(async (ev) => {
			if (ev.action.manifestId == manifestId) {
				await boundedListener(ev);
			}
		});
	}
}

/**
 * Event associated with an {@link Action}.
 */
type RoutingEvent = {
	/**
	 * The {@link Action} the event is associated with.
	 */
	action: Action;
};
