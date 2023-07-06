import { logger } from "../common/logging";
import { Action } from "../interactivity/action";
import { StreamDeckClient } from "../interactivity/client";
import { Manifest } from "../manifest";
import { SingletonAction } from "./singleton-action";

/**
 * Provides routing of {@link StreamDeckClient} events to action classes.
 */
export class Router {
	/**
	 * Collection of registered routes.
	 */
	private readonly routes: Route[] = [];

	/**
	 * Initializes a new instance of the {@link Router} class.
	 * @param client The Stream Deck client.
	 * @param manifest Manifest associated with the plugin.
	 */
	constructor(private readonly client: StreamDeckClient, private readonly manifest: Manifest) {}

	/**
	 * Routes all action-based events associated with the {@link manifestId} to the specified {@link action}.
	 * @param manifestId Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`), e.g. "com.elgato.wave-link.mute".
	 * @param action The action that will receive the events.
	 * @example
	 * ```
	 * class MyCustomAction extends SingletonAction {
	 *     public onDialDown(ev: ActionEvent<messages.DialDown<TSettings>>) {
	 *         // Some awesome thing.
	 *     }
	 * }
	 *
	 * streamDeck.router.route("com.elgato.example.my-custom-action", new MyCustomAction());
	 * ```
	 */
	public route<TAction extends SingletonAction<TSettings>, TSettings = unknown>(manifestId: string, action: TAction) {
		if (this.manifest.Actions.find((a) => a.UUID === manifestId)) {
			this.routes.push(new Route(this.client, manifestId, action));
		} else {
			logger.logWarn(`Failed to route action. The specified action UUID does not exist in the manifest: ${manifestId}`);
		}
	}
}

/**
 * Provides information about a route for an action.
 */
class Route {
	/**
	 * Initializes a new instance of the {@link Route} class.
	 * @param client The Stream Deck client.
	 * @param manifestId Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`), e.g. "com.elgato.wave-link.mute".
	 * @param action The action that will receive the events.
	 */
	constructor(private readonly client: StreamDeckClient, public readonly manifestId: string, private readonly action: SingletonAction) {
		this.addEventListener(this.manifestId, this.client.onDialDown, this.action.onDialDown);
		this.addEventListener(this.manifestId, this.client.onDialUp, this.action.onDialUp);
		this.addEventListener(this.manifestId, this.client.onDialRotate, this.action.onDialRotate);
		this.addEventListener(this.manifestId, this.client.onDidReceiveSettings, this.action.onDidReceiveSettings);
		this.addEventListener(this.manifestId, this.client.onKeyDown, this.action.onKeyDown);
		this.addEventListener(this.manifestId, this.client.onKeyUp, this.action.onKeyUp);
		this.addEventListener(this.manifestId, this.client.onPropertyInspectorDidAppear, this.action.onPropertyInspectorDidAppear);
		this.addEventListener(this.manifestId, this.client.onPropertyInspectorDidDisappear, this.action.onPropertyInspectorDidDisappear);
		this.addEventListener(this.manifestId, this.client.onSendToPlugin, this.action.onSendToPlugin);
		this.addEventListener(this.manifestId, this.client.onTitleParametersDidChange, this.action.onTitleParametersDidChange);
		this.addEventListener(this.manifestId, this.client.onTouchTap, this.action.onTouchTap);
		this.addEventListener(this.manifestId, this.client.onWillAppear, this.action.onWillAppear);
		this.addEventListener(this.manifestId, this.client.onWillDisappear, this.action.onWillDisappear);
	}

	/**
	 * Registers the specified {@link listener} against the {@link event}; the listener is only invoked when the event is associated with the specified {@link manifestId}.
	 * @param manifestId Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`), e.g. "com.elgato.wave-link.mute".
	 * @param event Event to listen for.
	 * @param listener The listener that will be invoked when the `event` occurs.
	 */
	private addEventListener<TEventArgs extends RoutingEvent>(manifestId: string, event: (listener: (ev: TEventArgs) => void) => void, listener: ((ev: TEventArgs) => Promise<void> | void) | undefined) {
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
