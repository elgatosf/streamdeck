import { StreamDeckClient } from "../client";
import { PayloadObject } from "../connectivity/events";
import { Action } from "./action";
import { SingletonAction } from "./singleton-action";

/**
 * Routes events emitted from the {@link client} to the action {@link action}; events intended for the {@link action} are identified by the manifest's identifier.
 * @param client The Stream Deck client.
 * @param action The action that will receive the events.
 */
export function addRoute<TAction extends SingletonAction<TSettings>, TSettings extends PayloadObject<TSettings> = object>(client: StreamDeckClient, action: TAction): void {
	if (action.manifestId === undefined) {
		throw new Error("The action's manifestId cannot be undefined.");
	}

	addEventListener(action.manifestId, client.onDialDown, action.onDialDown);
	addEventListener(action.manifestId, client.onDialUp, action.onDialUp);
	addEventListener(action.manifestId, client.onDialRotate, action.onDialRotate);
	addEventListener(action.manifestId, client.onDidReceiveSettings, action.onDidReceiveSettings);
	addEventListener(action.manifestId, client.onKeyDown, action.onKeyDown);
	addEventListener(action.manifestId, client.onKeyUp, action.onKeyUp);
	addEventListener(action.manifestId, client.onPropertyInspectorDidAppear, action.onPropertyInspectorDidAppear);
	addEventListener(action.manifestId, client.onPropertyInspectorDidDisappear, action.onPropertyInspectorDidDisappear);
	addEventListener(action.manifestId, client.onSendToPlugin, action.onSendToPlugin);
	addEventListener(action.manifestId, client.onTitleParametersDidChange, action.onTitleParametersDidChange);
	addEventListener(action.manifestId, client.onTouchTap, action.onTouchTap);
	addEventListener(action.manifestId, client.onWillAppear, action.onWillAppear);
	addEventListener(action.manifestId, client.onWillDisappear, action.onWillDisappear);

	/**
	 * Registers the specified {@link listener} against the {@link event}; the listener is only invoked when the event is associated with the specified {@link manifestId}.
	 * @param manifestId Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`), e.g. "com.elgato.wave-link.mute".
	 * @param event Event to listen for.
	 * @param listener The listener that will be invoked when the `event` occurs.
	 */
	function addEventListener<TEventArgs extends RoutingEvent<TSettings>>(
		manifestId: string,
		event: (listener: (ev: TEventArgs) => void) => void,
		listener: ((ev: TEventArgs) => Promise<void> | void) | undefined
	): void {
		const boundedListener = listener?.bind(action);
		if (boundedListener === undefined) {
			return;
		}

		event.bind(client)(async (ev) => {
			if (ev.action.manifestId == manifestId) {
				await boundedListener(ev);
			}
		});
	}
}

/**
 * Event associated with an {@link Action}.
 */
type RoutingEvent<T extends PayloadObject<T>> = {
	/**
	 * The {@link Action} the event is associated with.
	 */
	action: Action<T>;
};
