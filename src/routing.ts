import { Action } from "./actions";
import { StreamDeckClient } from "./client";
import { logger } from "./common/logging";
import * as messages from "./connectivity/messages";
import { ActionEvent, ActionWithoutPayloadEvent, SendToPluginEvent } from "./events";
import { Manifest } from "./manifest";

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
	 */
	public route<T extends SingletonAction>(manifestId: string, action: T) {
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

/**
 * Provides the main bridge between the plugin and the Stream Deck allowing the plugin to send requests and receive events, e.g. when the user presses an action.
 */
export class SingletonAction<TSettings = unknown> {
	/**
	 * Occurs when the user presses a dial (Stream Deck+). **NB** For other action types see {@link StreamDeckClient.onKeyDown}. Also see {@link StreamDeckClient.onDialUp}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialDown?(ev: ActionEvent<messages.DialDown<TSettings>>): void;

	/**
	 * Occurs when the user rotates a dial (Stream Deck+).
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialRotate?(ev: ActionEvent<messages.DialRotate<TSettings>>): void;

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck+). **NB** For other action types see {@link StreamDeckClient.onKeyUp}. Also see {@link StreamDeckClient.onDialDown}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialUp?(ev: ActionEvent<messages.DialUp<TSettings>>): void;

	/**
	 * Occurs when the settings associated with an action instance are requested using {@link StreamDeckClient.getSettings}, or when the the settings were updated by the property inspector.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveSettings?(ev: ActionEvent<messages.DidReceiveSettings<TSettings>>): void;

	/**
	 * Occurs when the user presses a action down. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialDown}. Also see {@link StreamDeckClient.onKeyUp}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyDown?(ev: ActionEvent<messages.KeyDown<TSettings>>): void;

	/**
	 * Occurs when the user releases a pressed action. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialUp}. Also see {@link StreamDeckClient.onKeyDown}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyUp?(ev: ActionEvent<messages.KeyUp<TSettings>>): void;

	/**
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidDisappear}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidAppear?(ev: ActionWithoutPayloadEvent<messages.PropertyInspectorDidAppear>): void;

	/**
	 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidAppear}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidDisappear?(ev: ActionWithoutPayloadEvent<messages.PropertyInspectorDidDisappear>): void;

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link StreamDeckClient.sendToPropertyInspector}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onSendToPlugin?(ev: SendToPluginEvent<object>): void;

	/**
	 * Occurs when the user updates an action's title settings in the Stream Deck application. Also see {@link StreamDeckClient.setTitle}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onTitleParametersDidChange?(ev: ActionEvent<messages.TitleParametersDidChange<TSettings>>): void;

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck+).
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onTouchTap?(ev: ActionEvent<messages.TouchTap<TSettings>>): void;

	/**
	 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
	 * page". An action refers to _all_ types of actions, e.g. keys, dials,
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onWillAppear?(ev: ActionEvent<messages.WillAppear<TSettings>>): Promise<void> | void;

	/**
	 * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys,
	 * dials, touchscreens, pedals, etc.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onWillDisappear?(ev: ActionEvent<messages.WillDisappear<TSettings>>): void;
}
