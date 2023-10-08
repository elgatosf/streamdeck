import { SetImage, SetTitle, SetTriggerDescription } from "./connectivity/commands";
import { StreamDeckConnection } from "./connectivity/connection";
import * as api from "./connectivity/events";
import { State } from "./connectivity/events";
import { FeedbackPayload } from "./connectivity/layouts";
import { Device } from "./devices";
import {
	ActionEvent,
	ActionWithoutPayloadEvent,
	ApplicationDidLaunchEvent,
	ApplicationDidTerminateEvent,
	ApplicationEvent,
	DeviceDidConnectEvent,
	DeviceDidDisconnectEvent,
	DeviceEvent,
	DialDownEvent,
	DialRotateEvent,
	DialUpEvent,
	DidReceiveGlobalSettingsEvent,
	DidReceiveSettingsEvent,
	Event,
	KeyDownEvent,
	KeyUpEvent,
	PropertyInspectorDidAppearEvent,
	PropertyInspectorDidDisappearEvent,
	SendToPluginEvent,
	SystemDidWakeUpEvent,
	TitleParametersDidChangeEvent,
	TouchTapEvent,
	WillAppearEvent,
	WillDisappearEvent
} from "./events";
import type { Manifest } from "./manifest";

/**
 * Provides the main bridge between the plugin and the Stream Deck allowing the plugin to send requests and receive events, e.g. when the user presses an action.
 */
export class StreamDeckClient {
	/**
	 * Initializes a new instance of the {@link StreamDeckClient} class.
	 * @param connection Underlying connection with the Stream Deck.
	 * @param devices Device collection responsible for tracking devices.
	 */
	constructor(private readonly connection: StreamDeckConnection, private readonly devices: ReadonlyMap<string, Device>) {}

	/**
	 * Gets the global settings associated with the plugin. Use in conjunction with {@link StreamDeckClient.setGlobalSettings}.
	 * @template T The type of global settings associated with the plugin.
	 * @returns Promise containing the plugin's global settings.
	 */
	public getGlobalSettings<T extends api.PayloadObject<T> = object>(): Promise<T> {
		return new Promise((resolve) => {
			this.connection.once("didReceiveGlobalSettings", (ev: api.DidReceiveGlobalSettings<T>) => resolve(ev.payload.settings));
			this.connection.send({
				event: "getGlobalSettings",
				context: this.connection.registrationParameters.pluginUUID
			});
		});
	}

	/**
	 * Gets the settings associated with an instance of an action, as identified by the {@link context}. An instance of an action represents a button, dial, pedal, etc. See also
	 * {@link StreamDeckClient.setSettings}.
	 * @template T The type of settings associated with the action.
	 * @param context Unique identifier of the action instance whose settings are being requested.
	 * @returns Promise containing the action instance's settings.
	 */
	public getSettings<T extends api.PayloadObject<T> = object>(context: string): Promise<T> {
		return new Promise((resolve) => {
			const callback = (ev: api.DidReceiveSettings<T>): void => {
				if (ev.context == context) {
					resolve(ev.payload.settings);
					this.connection.removeListener("didReceiveSettings", callback);
				}
			};

			this.connection.on("didReceiveSettings", callback);
			this.connection.send({
				event: "getSettings",
				context
			});
		});
	}

	/**
	 * Occurs when a monitored application is launched. Monitored applications can be defined in the manifest via the {@link Manifest.ApplicationsToMonitor} property.
	 * Also see {@link StreamDeckClient.onApplicationDidTerminate}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onApplicationDidLaunch(listener: (ev: ApplicationDidLaunchEvent) => void): void {
		this.connection.on("applicationDidLaunch", (ev) => listener(new ApplicationEvent(ev)));
	}

	/**
	 * Occurs when a monitored application terminates. Monitored applications can be defined in the manifest via the {@link Manifest.ApplicationsToMonitor} property.
	 * Also see {@link StreamDeckClient.onApplicationDidLaunch}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onApplicationDidTerminate(listener: (ev: ApplicationDidTerminateEvent) => void): void {
		this.connection.on("applicationDidTerminate", (ev) => listener(new ApplicationEvent(ev)));
	}

	/**
	 * Occurs when a Stream Deck device is connected. Also see {@link StreamDeckClient.onDeviceDidConnect}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDeviceDidConnect(listener: (ev: DeviceDidConnectEvent) => void): void {
		this.connection.on("deviceDidConnect", (ev) =>
			listener(
				new DeviceEvent(ev, {
					...ev.deviceInfo,
					...{ id: ev.device, isConnected: true }
				})
			)
		);
	}

	/**
	 * Occurs when a Stream Deck device is disconnected. Also see {@link StreamDeckClient.onDeviceDidDisconnect}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDeviceDidDisconnect(listener: (ev: DeviceDidDisconnectEvent) => void): void {
		this.connection.on("deviceDidDisconnect", (ev) =>
			listener(
				new DeviceEvent(ev, {
					...this.devices.get(ev.device),
					...{ id: ev.device, isConnected: false }
				})
			)
		);
	}

	/**
	 * Occurs when the user presses a dial (Stream Deck+). **NB** For other action types see {@link StreamDeckClient.onKeyDown}. Also see {@link StreamDeckClient.onDialUp}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialDown<T extends api.PayloadObject<T> = object>(listener: (ev: DialDownEvent<T>) => void): void {
		this.connection.on("dialDown", (ev: api.DialDown<T>) => listener(new ActionEvent<api.DialDown<T>>(this, ev)));
	}

	/**
	 * Occurs when the user rotates a dial (Stream Deck+).
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialRotate<T extends api.PayloadObject<T> = object>(listener: (ev: DialRotateEvent<T>) => void): void {
		this.connection.on("dialRotate", (ev: api.DialRotate<T>) => listener(new ActionEvent<api.DialRotate<T>>(this, ev)));
	}

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck+). **NB** For other action types see {@link StreamDeckClient.onKeyUp}. Also see {@link StreamDeckClient.onDialDown}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialUp<T extends api.PayloadObject<T> = object>(listener: (ev: DialUpEvent<T>) => void): void {
		this.connection.on("dialUp", (ev: api.DialUp<T>) => listener(new ActionEvent<api.DialUp<T>>(this, ev)));
	}

	/**
	 * Occurs when the global settings are requested using {@link StreamDeckClient.getGlobalSettings}, or when the the global settings were updated by the property inspector.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveGlobalSettings<T extends api.PayloadObject<T> = object>(listener: (ev: DidReceiveGlobalSettingsEvent<T>) => void): void {
		this.connection.on("didReceiveGlobalSettings", (ev: api.DidReceiveGlobalSettings<T>) => listener(new DidReceiveGlobalSettingsEvent(ev)));
	}

	/**
	 * Occurs when the settings associated with an action instance are requested using {@link StreamDeckClient.getSettings}, or when the the settings were updated by the property inspector.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveSettings<T extends api.PayloadObject<T> = object>(listener: (ev: DidReceiveSettingsEvent<T>) => void): void {
		this.connection.on("didReceiveSettings", (ev: api.DidReceiveSettings<T>) => listener(new ActionEvent<api.DidReceiveSettings<T>>(this, ev)));
	}

	/**
	 * Occurs when the user presses a action down. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialDown}. Also see {@link StreamDeckClient.onKeyUp}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyDown<T extends api.PayloadObject<T> = object>(listener: (ev: KeyDownEvent<T>) => void): void {
		this.connection.on("keyDown", (ev: api.KeyDown<T>) => listener(new ActionEvent<api.KeyDown<T>>(this, ev)));
	}

	/**
	 * Occurs when the user releases a pressed action. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialUp}. Also see {@link StreamDeckClient.onKeyDown}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyUp<T extends api.PayloadObject<T> = object>(listener: (ev: KeyUpEvent<T>) => void): void {
		this.connection.on("keyUp", (ev: api.KeyUp<T>) => listener(new ActionEvent<api.KeyUp<T>>(this, ev)));
	}

	/**
	 * Occurs when the property inspector associated with the action becomes visible, i.e. the user selected an action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidDisappear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidAppear<T extends api.PayloadObject<T> = object>(listener: (ev: PropertyInspectorDidAppearEvent<T>) => void): void {
		this.connection.on("propertyInspectorDidAppear", (ev: api.PropertyInspectorDidAppear) => listener(new ActionWithoutPayloadEvent<api.PropertyInspectorDidAppear, T>(this, ev)));
	}

	/**
	 * Occurs when the property inspector associated with the action becomes invisible, i.e. the user unselected the action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidAppear}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidDisappear<T extends api.PayloadObject<T> = object>(listener: (ev: PropertyInspectorDidDisappearEvent<T>) => void): void {
		this.connection.on("propertyInspectorDidDisappear", (ev: api.PropertyInspectorDidDisappear) =>
			listener(new ActionWithoutPayloadEvent<api.PropertyInspectorDidDisappear, T>(this, ev))
		);
	}

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using {@link StreamDeckClient.sendToPropertyInspector}.
	 * @template T The type of the payload received from the property inspector.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onSendToPlugin<T extends api.PayloadObject<T> = object, TSettings extends api.PayloadObject<TSettings> = object>(
		listener: (ev: SendToPluginEvent<T, TSettings>) => void
	): void {
		this.connection.on("sendToPlugin", (ev: api.SendToPlugin<T>) => listener(new SendToPluginEvent<T, TSettings>(this, ev)));
	}

	/**
	 * Occurs when the computer wakes up.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onSystemDidWakeUp(listener: (ev: SystemDidWakeUpEvent) => void): void {
		this.connection.on("systemDidWakeUp", (ev) => listener(new Event<api.SystemDidWakeUp>(ev)));
	}

	/**
	 * Occurs when the user updates an action's title settings in the Stream Deck application. Also see {@link StreamDeckClient.setTitle}.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onTitleParametersDidChange<T extends api.PayloadObject<T> = object>(listener: (ev: TitleParametersDidChangeEvent<T>) => void): void {
		this.connection.on("titleParametersDidChange", (ev: api.TitleParametersDidChange<T>) => listener(new ActionEvent<api.TitleParametersDidChange<T>>(this, ev)));
	}

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck+).
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onTouchTap<TSettings extends api.PayloadObject<TSettings> = object>(listener: (ev: TouchTapEvent<TSettings>) => void): void {
		this.connection.on("touchTap", (ev: api.TouchTap<TSettings>) => listener(new ActionEvent<api.TouchTap<TSettings>>(this, ev)));
	}

	/**
	 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
	 * page". An action refers to _all_ types of actions, e.g. keys, dials,
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onWillAppear<T extends api.PayloadObject<T> = object>(listener: (ev: WillAppearEvent<T>) => void): void {
		this.connection.on("willAppear", (ev: api.WillAppear<T>) => listener(new ActionEvent<api.WillAppear<T>>(this, ev)));
	}

	/**
	 * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys,
	 * dials, touchscreens, pedals, etc.
	 * @template T The type of settings associated with the action.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onWillDisappear<T extends api.PayloadObject<T> = object>(listener: (ev: WillDisappearEvent<T>) => void): void {
		this.connection.on("willDisappear", (ev: api.WillDisappear<T>) => listener(new ActionEvent<api.WillDisappear<T>>(this, ev)));
	}

	/**
	 * Opens the specified `url` in the user's default browser.
	 * @param url URL to open.
	 * @returns `Promise` resolved when the request to open the `url` has been sent to Stream Deck.
	 */
	public openUrl(url: string): Promise<void> {
		return this.connection.send({
			event: "openUrl",
			payload: {
				url
			}
		});
	}

	/**
	 * Sends the {@link payload} to the current property inspector associated with an instance of an action, as identified by the {@link context}. The plugin can also receive information
	 * from the property inspector via the `"sendToPlugin"` event, allowing for bi-directional communication. **Note**, the {@link payload} is only received by the property inspector
	 * when it is associated with the specified {@link context}.
	 * @param context Unique identifier of the action instance whose property inspector will receive the {@link payload}.
	 * @param payload Payload to send to the property inspector.
	 * @returns `Promise` resolved when the request to send the {@link payload} to the property inspector has been sent to Stream Deck.
	 */
	public sendToPropertyInspector<T extends api.PayloadObject<T> = object>(context: string, payload: T): Promise<void> {
		return this.connection.send({
			event: "sendToPropertyInspector",
			context,
			payload
		});
	}

	/**
	 * Sets the {@link feedback} for the layout associated with an action instance allowing for visual items to be updated. Layouts are a powerful way to provide dynamic information
	 * to users, and can be assigned in the manifest, or dynamically via {@link StreamDeckClient.setFeedbackLayout}.
	 *
	 * The {@link feedback} payload defines which items within the layout should be updated, and are identified by their property name (defined as the `key` in the layout's definition).
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
	 * streamDeck.client.setFeedback(ctx, {
	 *  // "text_item" matches a "key" within the layout's JSON file.
	 *   text_item: "Some new value"
	 * })
	 * ```
	 *
	 * Alternatively, more information can be updated.
	 * ```
	 * streamDeck.client.setFeedback(ctx, {
	 *   text_item: { // <-- "text_item" matches a "key" within the layout's JSON file.
	 *     value: "Some new value",
	 *     alignment: "center"
	 *   }
	 * });
	 * ```
	 * @param context Unique identifier of the action instance whose feedback will be updated.
	 * @param feedback Object containing information about the layout items to be updated.
	 * @returns `Promise` resolved when the request to set the {@link feedback} has been sent to Stream Deck.
	 */
	public setFeedback(context: string, feedback: FeedbackPayload): Promise<void> {
		return this.connection.send({
			event: "setFeedback",
			context,
			payload: feedback
		});
	}

	/**
	 * Sets the layout associated with an action instance, as identified by the {@link context}. The layout must be either a built-in layout identifier, or path to a local layout JSON file
	 * within the plugin's folder. Use in conjunction with {@link StreamDeckClient.setFeedback} to update the layouts current settings once it has been changed.
	 * @param context Unique identifier of the action instance whose layout will be updated.
	 * @param layout Name of a pre-defined layout, or relative path to a custom one.
	 * @returns `Promise` resolved when the new layout has been sent to Stream Deck.
	 */
	public setFeedbackLayout(context: string, layout: string): Promise<void> {
		return this.connection.send({
			event: "setFeedbackLayout",
			context,
			payload: {
				layout
			}
		});
	}

	/**
	 * Sets the global {@link settings} associated the plugin. **Note**, these settings are only available to this plugin, and should be used to persist information securely. Use in
	 * conjunction with {@link StreamDeckClient.getGlobalSettings}.
	 * @param settings Settings to save.
	 * @returns `Promise` resolved when the global `settings` are sent to Stream Deck.
	 * @example
	 * streamDeck.client.setGlobalSettings({
	 *   apiKey,
	 *   connectedDate: new Date()
	 * })
	 */
	public setGlobalSettings<T>(settings: T): Promise<void> {
		return this.connection.send({
			event: "setGlobalSettings",
			context: this.connection.registrationParameters.pluginUUID,
			payload: settings
		});
	}

	/**
	 * Sets the {@link image} displayed for an instance of an action, as identified by the {@link context}. **NB** This will be ignored if the user has chosen a custom image within
	 * the Stream Deck application.
	 * @param context Unique identifier of the action instance whose image will be updated.
	 * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.),
	 * or an SVG `string`. When `image` is `undefined`, the image from the manifest is used.
	 * @param options Additional options that define where and how the image should be rendered.
	 * @returns `Promise` resolved when the request to set the {@link image} has been sent to Stream Deck.
	 */
	public setImage(context: string, image?: string, options?: ImageOptions): Promise<void> {
		return this.connection.send({
			event: "setImage",
			context,
			payload: {
				image,
				...options
			}
		});
	}

	/**
	 * Sets the {@link settings} associated with an instance of an action, as identified by the {@link context}. An instance of an action represents a button, dial, pedal, etc. Use
	 * in conjunction with {@link StreamDeckClient.getSettings}.
	 * @param context Unique identifier of the action instance whose settings will be updated.
	 * @param settings Settings to associate with the action instance.
	 * @returns `Promise` resolved when the {@link settings} are sent to Stream Deck.
	 * @example
	 * streamDeck.client.setSettings(ctx, {
	 *   name: "Elgato"
	 * })
	 */
	public setSettings<T>(context: string, settings: T): Promise<void> {
		return this.connection.send({
			event: "setSettings",
			context,
			payload: settings
		});
	}

	/**
	 * Sets the current state of an action instance; this only applies to actions that have multiple states defined within the manifest.
	 * @param context Unique identifier of the action instance who state will be set.
	 * @param state State to set; this be either 0, or 1.
	 * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
	 */
	public setState(context: string, state: State): Promise<void> {
		return this.connection.send({
			event: "setState",
			context,
			payload: {
				state
			}
		});
	}

	/**
	 * Sets the {@link title} displayed for an instance of an action, as identified by the {@link context}. See also {@link StreamDeckClient.onTitleParametersDidChange}.
	 * @param context Unique identifier of the action instance whose title will be updated.
	 * @param title Title to display; when undefined the title within the manifest will be used. **NB.** the title will only be set if the user has not specified a custom title.
	 * @param options Additional options that define where and how the title should be rendered.
	 * @returns `Promise` resolved when the request to set the {@link title} has been sent to Stream Deck.
	 */
	public setTitle(context: string, title?: string, options?: TitleOptions): Promise<void> {
		return this.connection.send({
			event: "setTitle",
			context,
			payload: {
				title,
				...options
			}
		});
	}

	/**
	 * Sets the trigger (interaction) {@link descriptions} associated with an action. Descriptions are shown within the Stream Deck application, and informs the user what will happen
	 * when they interact with the action, e.g. rotate, touch, etc. When {@link descriptions} is `undefined`, the descriptions will be reset to the values provided as part of the manifest.
	 * **NB** only applies to encoders as part of Stream Deck+ (dials / touchscreens).
	 * @param context Unique identifier of the action instance where the warning will be shown.
	 * @param descriptions Descriptions that detail the action's interaction.
	 * @returns `Promise` resolved when the request to set the {@link descriptions} has been sent to Stream Deck.
	 */
	public setTriggerDescription(context: string, descriptions?: SetTriggerDescription["payload"]): Promise<void> {
		return this.connection.send({
			event: "setTriggerDescription",
			context,
			payload: descriptions || {}
		});
	}

	/**
	 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on an action, as identified by the {@link context}. Used to provide visual
	 * feedback when an action failed.
	 * @param context Unique identifier of the action instance where the warning will be shown.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 */
	public showAlert(context: string): Promise<void> {
		return this.connection.send({
			event: "showAlert",
			context
		});
	}

	/**
	 * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on an action, as identified by the {@link context}. Used to provide visual feedback
	 * when an action successfully executed.
	 * @param context Unique identifier of the action instance where the "OK" will be shown.
	 * @returns `Promise` resolved when the request to show an "OK" has been sent to Stream Deck.
	 */
	public showOk(context: string): Promise<void> {
		return this.connection.send({
			event: "showOk",
			context
		});
	}

	/**
	 * Requests the Stream Deck switches the current profile of the specified {@link device}, to the {@link profile}. **NB**, plugins can only switch to profiles included as part
	 * of the plugin and defined within the manifest, and cannot switch to custom profiles created by users.
	 * @param profile Name of the profile to switch to. The name must be identical to the one provided in the manifest.
	 * @param device Unique identifier of the device where the profile should be set.
	 * @returns `Promise` resolved when the request to switch the `profile` has been sent to Stream Deck.
	 */
	public switchToProfile(profile: string, device: string): Promise<void> {
		return this.connection.send({
			event: "switchToProfile",
			context: this.connection.registrationParameters.pluginUUID,
			device,
			payload: {
				profile
			}
		});
	}
}

/**
 * Options that define how to render an image associated with an action.
 */
export type ImageOptions = Omit<SetImage["payload"], "image">;

/**
 * Options that define how to render a title associated with an action.
 */
export type TitleOptions = Omit<SetTitle["payload"], "title">;
