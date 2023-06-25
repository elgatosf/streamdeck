import * as messages from "../connectivity/messages";
import { State } from "../connectivity/messages";
import { Device } from "../devices";
import { ActionEvent, ActionWithoutPayloadEvent, ApplicationEvent, DeviceEvent, SendToPluginEvent, SettingsEvent } from "../events";
import { Bar, GBar, Pixmap, Text } from "./layouts";
import { Manifest } from "./manifest";

/**
 * Provides the main bridge between the plugin and the Stream Deck allowing the plugin to send requests and receive events, e.g. when the user presses an action.
 */
export type StreamDeckClient = {
	/**
	 * Gets the global settings associated with the plugin. Use in conjunction with {@link StreamDeckClient.setGlobalSettings}.
	 * @returns Promise containing the plugin's global settings.
	 */
	getGlobalSettings<T = unknown>(): Promise<Partial<T>>;

	/**
	 * Gets the settings associated with an instance of an action, as identified by the `context`. An instance of an action represents a button, dial, pedal, etc. Use in conjunction
	 * with {@link StreamDeckClient.setSettings}.
	 * @param context Unique identifier of the action instance whose settings are being requested.
	 * @returns Promise containing the action instance's settings.
	 */
	getSettings<T = unknown>(context: string): Promise<Partial<T>>;

	/**
	 * Occurs when a monitored application is launched. Monitored applications can be defined in the `manifest.json` file via the {@link Manifest.ApplicationsToMonitor} property.
	 * Also see {@link StreamDeckClient.onApplicationDidTerminate}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onApplicationDidLaunch(listener: (ev: ApplicationEvent<messages.ApplicationDidLaunch>) => void): void;

	/**
	 * Occurs when a monitored application terminates. Monitored applications can be defined in the `manifest.json` file via the {@link Manifest.ApplicationsToMonitor} property.
	 * Also see {@link StreamDeckClient.onApplicationDidLaunch}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onApplicationDidTerminate(listener: (ev: ApplicationEvent<messages.ApplicationDidTerminate>) => void): void;

	/**
	 * Occurs when a Stream Deck device is connected. Also see {@link StreamDeckClient.onDeviceDidConnect}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onDeviceDidConnect(listener: (ev: DeviceEvent<messages.DeviceDidConnect, Required<Device>>) => void): void;

	/**
	 * Occurs when a Stream Deck device is disconnected. Also see {@link StreamDeckClient.onDeviceDidDisconnect}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onDeviceDidDisconnect(listener: (ev: DeviceEvent<messages.DeviceDidDisconnect, Device>) => void): void;

	/**
	 * Occurs when the user presses a dial (Stream Deck+). **NB** For other action types see {@link StreamDeckClient.onKeyDown}. Also see {@link StreamDeckClient.onDialUp}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onDialDown<TSettings = unknown>(listener: (ev: ActionEvent<messages.DialDown<TSettings>>) => void): void;

	/**
	 * Occurs when the user rotates a dial (Stream Deck+).
	 * @param listener Function to be invoked when the event occurs.
	 */
	onDialRotate<TSettings = unknown>(listener: (ev: ActionEvent<messages.DialRotate<TSettings>>) => void): void;

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck+). **NB** For other action types see {@link StreamDeckClient.onKeyUp}. Also see {@link StreamDeckClient.onDialDown}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onDialUp<TSettings = unknown>(listener: (ev: ActionEvent<messages.DialUp<TSettings>>) => void): void;

	/**
	 * Occurs when the global settings are requested using {@link StreamDeckClient.getGlobalSettings}, or when the the global settings were updated by the property inspector.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onDidReceiveGlobalSettings<TSettings = unknown>(listener: (ev: SettingsEvent<TSettings>) => void): void;

	/**
	 * Occurs when the settings associated with an action instance are requested using {@link StreamDeckClient.getSettings}, or when the the settings were updated by the property inspector.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onDidReceiveSettings<TSettings = unknown>(listener: (ev: ActionEvent<messages.DidReceiveSettings<TSettings>>) => void): void;

	/**
	 * Occurs when the user presses a action down. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialDown}. Also see {@link StreamDeckClient.onKeyUp}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onKeyDown<TSettings = unknown>(listener: (ev: ActionEvent<messages.KeyDown<TSettings>>) => void): void;

	/**
	 * Occurs when the user releases a pressed action. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialUp}. Also see {@link StreamDeckClient.onKeyDown}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onKeyUp<TSettings = unknown>(listener: (ev: ActionEvent<messages.KeyUp<TSettings>>) => void): void;

	/**
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidDisappear}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onPropertyInspectorDidAppear(listener: (ev: ActionWithoutPayloadEvent<messages.PropertyInspectorDidAppear>) => void): void;

	/**
	 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidAppear}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onPropertyInspectorDidDisappear(listener: (ev: ActionWithoutPayloadEvent<messages.PropertyInspectorDidDisappear>) => void): void;

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link StreamDeckClient.sendToPropertyInspector}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onSendToPlugin<TPayload extends object>(listener: (ev: SendToPluginEvent<TPayload>) => void): void;

	/**
	 * Occurs when the computer wakes up.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onSystemDidWakeUp(listener: () => void): void;

	/**
	 * Occurs when the user updates an action's title settings in the Stream Deck application. Also see {@link StreamDeckClient.setTitle}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onTitleParametersDidChange<TSettings = unknown>(listener: (ev: ActionEvent<messages.TitleParametersDidChange<TSettings>>) => void): void;

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck+).
	 * @param listener Function to be invoked when the event occurs.
	 */
	onTouchTap<TSettings = unknown>(listener: (ev: ActionEvent<messages.TouchTap<TSettings>>) => void): void;

	/**
	 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
	 * page". An action refers to _all_ types of actions, e.g. keys, dials,
	 * @param listener Function to be invoked when the event occurs.
	 */
	onWillAppear<TSettings = unknown>(listener: (ev: ActionEvent<messages.WillAppear<TSettings>>) => void): void;

	/**
	 * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys,
	 * dials, touchscreens, pedals, etc.
	 * @param listener Function to be invoked when the event occurs.
	 */
	onWillDisappear<TSettings = unknown>(listener: (ev: ActionEvent<messages.WillDisappear<TSettings>>) => void): void;

	/**
	 * Opens the specified `url` in the user's default browser.
	 * @param url URL to open.
	 * @returns `Promise` resolved when the request to open the `url` has been sent to Stream Deck.
	 */
	openUrl(url: string): Promise<void>;

	/**
	 * Sends the `payload` to the current property inspector associated with an instance of an action, as identified by the `context`. The plugin can also receive information from
	 * the property inspector via the `"sendToPlugin"` event, allowing for bi-directional communication. **Note**, the `payload` is only received by the property inspector when it
	 * is associated with the specified `context`.
	 * @param context Unique identifier of the action instance whose property inspector will receive the `payload`.
	 * @param payload Payload to send to the property inspector.
	 * @returns `Promise` resolved when the request to send the `payload` to the property inspector has been sent to Stream Deck.
	 */
	sendToPropertyInspector(context: string, payload: unknown): Promise<void>;

	/**
	 * Sets the feedback of a layout associated with an action instance allowing for visual items to be updated. Layouts are a powerful way to provide dynamic information to users,
	 * and can be assigned in the manifest, or dynamically via {@link StreamDeckClient.setFeedbackLayout}.
	 *
	 * The `feedback` payload defines which items within the layout should be updated, and are identified by their property name (defined as the `key` in the layout's definition).
	 * The values can either by a complete new definition, a `string` for layout item types of `text` and `pixmap`, or a `number` for layout item types of `bar` and `gbar`.
	 *
	 * For example, given the following custom layout definition saved relatively to the plugin at "layouts/MyCustomLayout.json".
	 * ```
	 * {
	 *   "id": "MyCustomLayout",
	 *   "items": [{
	 *     "key": "text_item", // <-- Key used to identify which item is being updated.
	 *     "type": "text",
	 *     "rect": [16, 10, 136, 24],
	 *     "alignment": "left",
	 *     "value": "Some default value"
	 *   }]
	 * }
	 * ```
	 *
	 * And the layout assigned to an action within the manifest.
	 * ```
	 * {
	 *   "Actions": [{
	 *     "Encoder": {
	 *       "Layout": "layouts/MyCustomLayout.json"
	 *     }
	 *   }]
	 * }
	 * ```
	 *
	 * The layout item's text can be updated dynamically via.
	 * ```
	 * client.setFeedback(ctx, {
	 *  // "text_item" matches a "key" within the layout's JSON file.
	 *   text_item: "Some new value"
	 * })
	 * ```
	 *
	 * Alternatively, more information can be updated.
	 * ```
	 * client.setFeedback(ctx, {
	 *   text_item: { // <-- "text_item" matches a "key" within the layout's JSON file.
	 *     value: "Some new value",
	 *     alignment: "center"
	 *   }
	 * });
	 * ```
	 * @param context Unique identifier of the action instance whose feedback will be updated.
	 * @param feedback Object containing information about the layout items to be updated.
	 * @returns `Promise` resolved when the request to set the `feedback` has been sent to Stream Deck.
	 */
	setFeedback(context: string, feedback: FeedbackPayload): Promise<void>;

	/**
	 * Sets the layout associated with an action instance, as identified by the `context`. The layout must be either a built-in layout identifier, or path to a local layout JSON file
	 * within the plugin's folder. Use in conjunction with {@link StreamDeckClient.setFeedback} to update the layouts current settings once it has been changed.
	 * @param context Unique identifier of the action instance whose layout will be updated.
	 * @param layout Name of a pre-defined layout, or relative path to a custom one.
	 * @returns `Promise` resolved when the new layout has been sent to Stream Deck.
	 */
	setFeedbackLayout(context: string, layout: string): Promise<void>;

	/**
	 * Sets the global `settings` associated the plugin. **Note**, these settings are only available to this plugin, and should be used to persist information securely.
	 * Use conjunction with {@link StreamDeckClient.getGlobalSettings}.
	 * @param settings Settings to save.
	 * @returns `Promise` resolved when the global `settings` are sent to Stream Deck.
	 * @example
	 * streamDeck.setGlobalSettings({
	 *   apiKey,
	 *   connectedDate: new Date()
	 * })
	 */
	setGlobalSettings(settings: unknown): Promise<void>;

	/**
	 * Sets the `image` displayed for an instance of an action, as identified by the `context`.
	 * @param context Unique identifier of the action instance whose image will be updated.
	 * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
	 * or an SVG `string`. When `image` is `undefined`, the image from the manifest is used.
	 * @param state Action state the request applies to; when no state is supplied, the image is set for both states. **Note**, only applies to multi-state actions.
	 * @param target Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
	 * @returns `Promise` resolved when the request to set the `image` has been sent to Stream Deck.
	 */
	setImage(context: string, image: string, state?: State, target?: Target): Promise<void>;

	/**
	 * Sets the `settings` associated with an instance of an action, as identified by the `context`. An instance of an action represents a button, dial, pedal, etc.
	 * Use in conjunction with {@link StreamDeckClient.getSettings}.
	 * @param context Unique identifier of the action instance whose settings will be updated.
	 * @param settings Settings to associate with the action instance.
	 * @returns `Promise` resolved when the `settings` are sent to Stream Deck.
	 */
	setSettings(context: string, settings: unknown): Promise<void>;

	/**
	 * Sets the current state of an action instance; this only applies to actions that have multiple states defined within the manifest.json file.
	 * @param context Unique identifier of the action instance who state will be set.
	 * @param state State to set; this be either 0, or 1.
	 * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
	 */
	setState(context: string, state: State): Promise<void>;

	/**
	 * Sets the `title` displayed for an instance of an action, as identified by the `context`. Often used in conjunction with `"titleParametersDidChange"` event.
	 * @param context Unique identifier of the action instance whose title will be updated.
	 * @param title Title to display; when no title is specified, the title will reset to the title set by the user.
	 * @param state Action state the request applies to; when no state is supplied, the title is set for both states. **Note**, only applies to multi-state actions.
	 * @param target Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
	 * @returns `Promise` resolved when the request to set the `title` has been sent to Stream Deck.
	 */
	setTitle(context: string, title?: string, state?: State, target?: Target): Promise<void>;

	/**
	 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on an action, as identified by the `context`. Used to provide visual feedback
	 * when an action failed.
	 * @param context Unique identifier of the action instance where the warning will be shown.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 */
	showAlert(context: string): Promise<void>;

	/**
	 * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on an action, as identified by the `context`. Used to provide visual feedback when an
	 * action successfully executed.
	 * @param context Unique identifier of the action instance where the "OK" will be shown.
	 * @returns `Promise` resolved when the request to show an "OK" has been sent to Stream Deck.
	 */
	showOk(context: string): Promise<void>;

	/**
	 * Requests the Stream Deck switches the current profile of the specified `device`, to the profile defined by `profile`. **Note**, plugins can only switch to profiles included as part of the plugin, and
	 * defined within their manifest.json. Plugins cannot switch to custom profiles created by users.
	 * @param profile Name of the profile to switch to. The name must be identical to the one provided in the manifest.json file.
	 * @param device Unique identifier of the device where the profile should be set.
	 * @returns `Promise` resolved when the request to switch the `profile` has been sent to Stream Deck.
	 */
	switchToProfile(profile: string, device: string): Promise<void>;
};

/**
 * Payload object, used in conjunction with `setLayout`, that enables updating items within a layout.
 */
export type FeedbackPayload = Record<string, Partial<Bar> | Partial<GBar> | Partial<Pixmap> | Partial<Text> | number | string>;

/**
 * Defines the target of a request, i.e. whether the request should update the Stream Deck hardware, Stream Deck software (application), or both, when calling `setImage` and `setState`.
 */
export enum Target {
	/**
	 * Hardware and software should be updated as part of the request.
	 */
	HardwareAndSoftware = 0,

	/**
	 * Hardware only should be updated as part of the request.
	 */
	Hardware = 1,

	/**
	 * Software only should be updated as part of the request.
	 */
	Software = 2
}
