import type { Enumerable, JsonObject, JsonValue } from "@elgato/utils";

import type { DialAction } from "../actions/dial.js";
import type { KeyAction } from "../actions/key.js";
import type {
	DialDownEvent,
	DialRotateEvent,
	DialUpEvent,
	DidReceiveResourcesEvent,
	DidReceiveSettingsEvent,
	KeyDownEvent,
	KeyUpEvent,
	PropertyInspectorDidAppearEvent,
	PropertyInspectorDidDisappearEvent,
	SendToPluginEvent,
	TitleParametersDidChangeEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent,
} from "../events/index.js";
import type streamDeck from "../index.js";
import type { Action } from "./action.js";
import { actionStore } from "./store.js";

/**
 * Provides the main bridge between the plugin and the Stream Deck allowing the plugin to send requests and receive events, e.g. when the user presses an action.
 * @template T The type of settings associated with the action.
 */
export class SingletonAction<T extends JsonObject = JsonObject> {
	/**
	 * The universally-unique value that identifies the action within the manifest.
	 */
	public readonly manifestId: string | undefined;

	/**
	 * Gets the visible actions with the `manifestId` that match this instance's.
	 * @returns The visible actions.
	 */
	public get actions(): Enumerable<DialAction<T> | KeyAction<T>> {
		return actionStore.filter((a) => a.manifestId === this.manifestId);
	}

	/**
	 * Occurs when the user presses a dial (Stream Deck +). See also {@link SingletonAction.onDialUp}.
	 *
	 * NB: For other action types see {@link SingletonAction.onKeyDown}.
	 * @param ev Information about the event, including the source action and contextual payload information.
	 */
	public onDialDown?(ev: DialDownEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the user rotates a dial (Stream Deck +).
	 * @param ev Information about the event, including the source action and contextual payload information.
	 */
	public onDialRotate?(ev: DialRotateEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck +). See also {@link SingletonAction.onDialDown}.
	 *
	 * NB: For other action types see {@link SingletonAction.onKeyUp}.
	 * @param ev Information about the event, including the source action and contextual payload information.
	 */
	public onDialUp?(ev: DialUpEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the resources were updated within the property inspector.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveResources?(ev: DidReceiveResourcesEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the settings associated with an action instance are requested using {@link Action.getSettings}, or when the the settings were updated by the property inspector.
	 * @param ev Information about the event, including the source action and contextual payload information.
	 */
	public onDidReceiveSettings?(ev: DidReceiveSettingsEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the user presses a action down. See also {@link SingletonAction.onKeyUp}.
	 *
	 * NB: For dials / touchscreens see {@link SingletonAction.onDialDown}.
	 * @param ev Information about the event, including the source action and contextual payload information.
	 */
	public onKeyDown?(ev: KeyDownEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the user releases a pressed action. See also {@link SingletonAction.onKeyDown}.
	 *
	 * NB: For dials / touchscreens see {@link SingletonAction.onDialUp}.
	 * @param ev Information about the event, including the source action and contextual payload information.
	 */
	public onKeyUp?(ev: KeyUpEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. See also {@link streamDeck.ui.onDidAppear}.
	 * @param ev Information about the event, including the source action.
	 */
	public onPropertyInspectorDidAppear?(ev: PropertyInspectorDidAppearEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. See also {@link streamDeck.ui.onDidDisappear}.
	 * @param ev Information about the event, including the source action.
	 */
	public onPropertyInspectorDidDisappear?(ev: PropertyInspectorDidDisappearEvent<T>): Promise<void> | void;

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link Action.sendToPropertyInspector}.
	 * @param ev Information about the event, including the source action and contextual payload information.
	 */
	public onSendToPlugin?(ev: SendToPluginEvent<JsonValue, T>): Promise<void> | void;

	/**
	 * Occurs when the user updates an action's title settings in the Stream Deck application. See also {@link Action.setTitle}.
	 * @param ev Information about the event, including the source action and contextual payload information.
	 */
	public onTitleParametersDidChange?(ev: TitleParametersDidChangeEvent<T>): Promise<void> | void;

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck +).
	 * @param ev Information about the event, including the source action and contextual payload information.
	 */
	public onTouchTap?(ev: TouchTapEvent<T>): Promise<void> | void;

	/**
	 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
	 * page". An action refers to _all_ types of actions, e.g. keys, dials,
	 * @param ev Information about the event, including the source action and contextual payload information.
	 */
	public onWillAppear?(ev: WillAppearEvent<T>): Promise<void> | void;

	/**
	 * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys,
	 * dials, touchscreens, pedals, etc.
	 * @param ev Information about the event, including the source action and contextual payload information.
	 */
	public onWillDisappear?(ev: WillDisappearEvent<T>): Promise<void> | void;
}
