import {
	DialDownEvent,
	DialRotateEvent,
	DialUpEvent,
	DidReceiveSettingsEvent,
	InboundEvents,
	KeyDownEvent,
	KeyUpEvent,
	PropertyInspectorDidAppearEvent,
	PropertyInspectorDidDisappearEvent,
	SendToPluginEvent,
	StreamDeckEvent,
	TitleParametersDidChangeEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent
} from "./events";
import streamDeck from "./stream-deck";

/**
 * An action capable of handling events triggered by the Stream Deck.
 */
export type Action<TSettings = unknown> = {
	/**
	 * Occurs when the user presses a dial (Stream Deck+). **NB** For key actions see {@link Action.onKeyDown}.
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onDialDown?: (data: DialDownEvent<TSettings>) => void;

	/**
	 * Occurs when the user rotates a dial (Stream Deck+).
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onDialRotate?: (data: DialRotateEvent<TSettings>) => void;

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck+). **NB** For key actions see {@link Action.onKeyUp}.
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onDialUp?: (data: DialUpEvent<TSettings>) => void;

	/**
	 * Occurs when the settings associated with an action instance are requested using `streamDeck.getSettings(context)`, or when the the settings were updated by the property inspector.
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onDidReceiveSettings?: (data: DidReceiveSettingsEvent<TSettings>) => void;

	/**
	 * Occurs when the user presses a action down. **NB** For dials / touchscreens see {@link Action.onDialDown}.
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onKeyDown?: (data: KeyDownEvent<TSettings>) => void;

	/**
	 * Occurs when the user releases a pressed action. **NB** For dials / touchscreens see {@link Action.onDialUp}.
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onKeyUp?: (data: KeyUpEvent<TSettings>) => void;

	/**
	 * Occurs when the property inspector associated with the action becomes visible; occurs when the user selects the action in the Stream Deck application. Also see {@link Action.onPropertyInspectorDidDisappear}.
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onPropertyInspectorDidAppear?: (data: PropertyInspectorDidAppearEvent) => void;

	/**
	 * Occurs when the property inspector associated with the action becomes visible; occurs when the user unselects the action in the Stream Deck application. Also see {@link Action.onPropertyInspectorDidAppear}.
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onPropertyInspectorDidDisappear?: (data: PropertyInspectorDidDisappearEvent) => void;

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using `streamDeck.sendToPlugin(context, payload)`.
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onSendToPlugin?: (data: SendToPluginEvent<TSettings>) => void;

	/**
	 * Occurs when the user updates the title's settings in the Stream Deck application.
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onTitleParametersDidChange?: (data: TitleParametersDidChangeEvent<TSettings>) => void;

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck+).
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onTouchTap?: (data: TouchTapEvent<TSettings>) => void;

	/**
	 * Occurs when an action becomes visible on the Stream Deck device.
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onWillAppear?: (data: WillAppearEvent<TSettings>) => void;

	/**
	 * Occurs when an action is no longer visible on the Stream Deck device.
	 * @param data Data containing information about the event, including the action instance `context` the event is associated with.
	 */
	onWillDisappear?: (data: WillDisappearEvent<TSettings>) => void;
};

/**
 * Registers the specified `action` against the `actionName`. All messages received from the Stream Deck that are associated with the the `actionName` will be propagated to the `action`.
 * @param actionName Name of the action, as defined within the `manifest.json` file, e.g. "com.elgato.wave-link.mute", "com.elgato.control-center.toggle", etc.
 * @param action Action that will receive the related events.
 */
function routeAction<TSettings = unknown>(actionName: string, action: Action<TSettings>) {
	for (const [key, value] of Object.entries(action)) {
		if (value === undefined) {
			continue;
		}

		const eventName = key as keyof Action<TSettings> extends `on${infer TEventName}` ? Uncapitalize<TEventName> : never;
		const listener = value as (data: Extract<InboundEvents, StreamDeckEvent<typeof key>>) => void;

		streamDeck.on(eventName, (data) => {
			if (data.action === actionName) {
				listener(data);
			}
		});
	}
}

export default {
	routeAction
};
