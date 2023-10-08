import { StreamDeckClient } from "../client";
import { PayloadObject } from "../connectivity/events";
import {
	DialDownEvent,
	DialRotateEvent,
	DialUpEvent,
	DidReceiveSettingsEvent,
	KeyDownEvent,
	KeyUpEvent,
	PropertyInspectorDidAppearEvent,
	PropertyInspectorDidDisappearEvent,
	SendToPluginEvent,
	TitleParametersDidChangeEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent
} from "../events";

/**
 * Provides the main bridge between the plugin and the Stream Deck allowing the plugin to send requests and receive events, e.g. when the user presses an action.
 * @template T The type of settings associated with the action.
 */
export class SingletonAction<T extends PayloadObject<T> = object> {
	/**
	 * The universally-unique value that identifies the action within the manifest.
	 */
	public readonly manifestId: string | undefined;

	/**
	 * Occurs when the user presses a dial (Stream Deck+). **NB** For other action types see {@link StreamDeckClient.onKeyDown}. Also see {@link StreamDeckClient.onDialUp}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialDown?(ev: DialDownEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the user rotates a dial (Stream Deck+).
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialRotate?(ev: DialRotateEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck+). **NB** For other action types see {@link StreamDeckClient.onKeyUp}. Also see {@link StreamDeckClient.onDialDown}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialUp?(ev: DialUpEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the settings associated with an action instance are requested using {@link StreamDeckClient.getSettings}, or when the the settings were updated by the property inspector.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveSettings?(ev: DidReceiveSettingsEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the user presses a action down. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialDown}. Also see {@link StreamDeckClient.onKeyUp}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyDown?(ev: KeyDownEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the user releases a pressed action. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialUp}. Also see {@link StreamDeckClient.onKeyDown}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyUp?(ev: KeyUpEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidDisappear}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidAppear?(ev: PropertyInspectorDidAppearEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidAppear}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidDisappear?(ev: PropertyInspectorDidDisappearEvent<T>): Promise<void> | void;

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link StreamDeckClient.sendToPropertyInspector}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onSendToPlugin?(ev: SendToPluginEvent<object, T>): Promise<void> | void;

	/**
	 * Occurs when the user updates an action's title settings in the Stream Deck application. Also see {@link StreamDeckClient.setTitle}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onTitleParametersDidChange?(ev: TitleParametersDidChangeEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck+).
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onTouchTap?(ev: TouchTapEvent<T>): Promise<void> | void;

	/**
	 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
	 * page". An action refers to _all_ types of actions, e.g. keys, dials,
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onWillAppear?(ev: WillAppearEvent<T>): Promise<void> | void;

	/**
	 * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys,
	 * dials, touchscreens, pedals, etc.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onWillDisappear?(ev: WillDisappearEvent<T>): Promise<void> | void;
}
