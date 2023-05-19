import { EventEmitter } from "node:events";
import WebSocket from "ws";

import { Target } from "./enums";
import { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent, InboundEvents, OutboundEvents, StreamDeckEvent } from "./events";
import { FeedbackPayload } from "./layouts";
import logger from "./logger";
import { PromiseCompletionSource } from "./promises";
import { RegistrationParameters } from "./registration";

/**
 * The main bridge between the plugin and the Stream Deck, providing methods for listening to events emitted from the Stream Deck, and sending messages back.
 */
export class StreamDeck {
	/**
	 * Connection between the plugin and the Stream Deck in the form of a promise; once connected to the Stream Deck and the plugin has been registered, the promised is resolved and the connection becomes available.
	 */
	private readonly connection = new PromiseCompletionSource<WebSocket>();

	/**
	 * Event emitter used to propagate events from the Stream Deck to the plugin.
	 */
	private readonly eventEmitter = new EventEmitter();

	/**
	 * Web socket connection used by this instance to establish the connection with the Stream Deck.
	 */
	private readonly ws: WebSocket;

	/**
	 * Initializes a new instance of the Stream Deck class, used to transmit messages between the Stream Deck and the plugin.
	 * @param params Registration parameters used to establish a connection with the Stream Deck; these are automatically supplied as part of the command line arguments when the plugin is ran by the Stream Deck.
	 */
	constructor(private readonly params = new RegistrationParameters(process.argv)) {
		logger.debug("Initializing plugin.");

		this.ws = new WebSocket(`ws://localhost:${params.port}`);
		this.ws.onmessage = this.propagateMessage.bind(this);
		this.ws.onopen = () => {
			this.ws.send(
				JSON.stringify({
					event: params.registerEvent,
					uuid: params.pluginUUID
				})
			);

			// Web socket established a connection with the Stream Deck and the plugin was registered.
			this.connection.setResult(this.ws);
			logger.debug("Plugin connected to Stream Deck.");
		};
	}

	/**
	 * Gets the information supplied by Stream Deck during the initial registration procedure of the plugin.
	 * @returns Information about the user's operating system, plugin version, connected devices, etc.
	 */
	public get info() {
		return this.params.info;
	}

	/**
	 * Gets the logger used by this instance, used to log messages independently of a Stream Deck connection.
	 * @returns The logger.
	 */
	public get logger() {
		return logger;
	}

	/**
	 * Gets the plugin's unique identifier supplied by Stream Deck. The identifier is transmitted as part of specific messages sent to Stream Deck, e.g. "setGlobalSettings", "getGlobalSettings", and "switchToProfile".
	 * @returns This plugin's unique identifier.
	 */
	public get pluginUUID() {
		return this.params.pluginUUID;
	}

	/**
	 * Gets the global settings associated with the plugin. Use in conjunction with {@link StreamDeck.setGlobalSettings}.
	 * @returns Promise containing the plugin's global settings.
	 * @example
	 * (async function() {
	 *   const globalSettings = await streamDeck.getGlobalSettings();
	 *   myOtherService.setApiKey(globalSettings.payload.settings.apiKey);
	 * })();
	 */
	public async getGlobalSettings<T = unknown>(): Promise<DidReceiveGlobalSettingsEvent<T>> {
		const settings = new PromiseCompletionSource<DidReceiveGlobalSettingsEvent<T>>();
		this.once("didReceiveGlobalSettings", (data: DidReceiveGlobalSettingsEvent<T>) => settings.setResult(data));

		await this.send("getGlobalSettings", {
			context: this.pluginUUID
		});

		return settings.promise;
	}

	/**
	 * Gets the settings associated with an instance of an action, as identified by the `context`. An instance of an action represents a button, dial, pedal, etc. Use in conjunction with {@link StreamDeck.setSettings}.
	 * @param context Unique identifier of the action instance whose settings are being requested.
	 * @returns Promise containing the action instance's settings.
	 * @example
	 * streamDeck.on("willAppear", async data => {
	 *   // Get the settings of another action.
	 *   const otherSettings = await streamDeck.getSettings(myOtherActionContext);
	 *
	 *   // Display the information from that action, on the action that is appearing.
	 *   streamDeck.setTitle(data.context, otherSettings.payload.settings.myCustomMessage);
	 * });
	 */
	public async getSettings<T = unknown>(context: string): Promise<DidReceiveSettingsEvent<T>> {
		const settings = new PromiseCompletionSource<DidReceiveSettingsEvent<T>>();
		this.once("didReceiveSettings", (data: DidReceiveSettingsEvent<T>) => {
			if (data.context == context) {
				settings.setResult(data);
			}
		});

		await this.send("getSettings", {
			context
		});

		return settings.promise;
	}

	/**
	 * Adds the `listener` function to be invoked when Stream Deck emits the event named `eventName`, e.g. "willAppear" when an action becomes visible, "deviceDidDisconnect" when a device is connected to user's machine, etc.
	 * @param eventName Event to listen for.
	 * @param listener Callback invoked when Stream Deck emits the event.
	 * @returns This instance for chaining.
	 * @example
	 * streamDeck.on("willAppear", data => {
	 *   // Emitted when an action appears; data contains information about the action.
	 * });
	 * @example
	 * streamDeck.on("dialRotate", data => {
	 *   // Emitted when a Stream Deck+ dial is rotated; data contains information about the action.
	 * });
	 * @example
	 * streamDeck.on("sendToPlugin", data => {
	 *   // Emitted when the property inspector sends a message to the plugin; data contains the information.
	 * });
	 */
	public on<TEvent extends InboundEvents["event"], TEventArgs = Extract<InboundEvents, StreamDeckEvent<TEvent>>>(eventName: TEvent, listener: (data: TEventArgs) => void): this {
		this.eventEmitter.on(eventName, listener);
		return this;
	}

	/**
	 * Adds a **one-time** `listener` function to be invoked when Stream Deck emits the event named `eventName`. The next time `eventName` is triggered, this listener is removed and then invoked.
	 * @param eventName Event to listen for.
	 * @param listener Callback invoked when Stream Deck emits the event.
	 * @returns This instance for chaining.
	 * @example
	 * streamDeck.once("willAppear", data => {
	 *   // Emitted when an action appears; data contains information about the action.
	 * });
	 * @example
	 * streamDeck.once("dialRotate", data => {
	 *   // Emitted when a Stream Deck+ dial is rotated; data contains information about the action.
	 * });
	 * @example
	 * streamDeck.once("sendToPlugin", data => {
	 *   // Emitted when the property inspector sends a message to the plugin; data contains the information.
	 * });
	 */
	public once<TEvent extends InboundEvents["event"], TEventArgs = Extract<InboundEvents, StreamDeckEvent<TEvent>>>(eventName: TEvent, listener: (data: TEventArgs) => void): this {
		this.eventEmitter.once(eventName, listener);
		return this;
	}

	/**
	 * Opens the specified `url` in the user's default browser.
	 * @param url URL to open.
	 * @returns `Promise` resolved when the request to open the `url` has been sent to Stream Deck.
	 * @example
	 * streamDeck.openUrl("https://elgato.com");
	 */
	public openUrl(url: string): Promise<void> {
		return this.send("openUrl", {
			payload: {
				url
			}
		});
	}

	/**
	 * Sends the `payload` to the current property inspector associated with an instance of an action, as identified by the `context`. The plugin can also receive information from the property inspector
	 * via the `"sendToPlugin"` event, allowing for bi-directional communication. **Note**, the `payload` is only received by the property inspector when it is associated with the specified `context`.
	 * @param context Unique identifier of the action instance whose property inspector will receive the `payload`.
	 * @param payload Payload to send to the property inspector.
	 * @returns `Promise` resolved when the request to send the `payload` to the property inspector has been sent to Stream Deck.
	 */
	public sendToPropertyInspector(context: string, payload: unknown): Promise<void> {
		return this.send("sendToPropertyInspector", {
			context,
			payload
		});
	}

	/**
	 * Sets the feedback of a layout associated with an action instance, as identified by the `context`, allowing for visual items to be updated. Layouts are defined in the manifest, or
	 * dynamically via {@link StreamDeck.setFeedbackLayout}. Layouts are a powerful way to provide dynamic information to users; when updating feedback, the `feedback` object should contain
	 * properties that correlate with the items `key`, as defined in the layout's JSON file. Property values can be an `object`, used to update multiple properties of a layout item, or a `number`
	 * or `string` to update the `value` of the layout item.
	 * `number` or `string` may be provided to update the `value` associated with the layout item.
	 * @param context Unique identifier of the action instance whose feedback will be updated.
	 * @param feedback Object containing information about the feedback used to update the current layout of an action instance.
	 * @returns `Promise` resolved when the request to set the `feedback` has been sent to Stream Deck.
	 * @example
	 * // Feedback object that will set the value of the bar item to 10, for the layout item that has the key "progress" in the bespoke layout's JSON definition.
	 * const feedback = {
	 *   progress: 10
	 * };
	 * @example
	 * // Feedback object that will set the value of the pixmap item to "img/Logo.png" and make it visible, for the layout item that has the key "img" in the bespoke layout's JSON definition.
	 * const feedback = {
	 *   img: {
	 *     value: "img/Logo.png",
	 *     enabled: true
	 *   }
	 * };
	 * @example
	 * // Change the feedback when a dial rotates.
	 * streamDeck.on("dialRotate", async data => {
	 *   // Get the current settings, and update the `count` based on the direction of the rotation.
	 *   const { payload: { settings }} = await streamDeck.getSettings(data.context);
	 *   settings.count += data.payload.ticks;
	 *   await streamDeck.setSettings(settings);
	 *
	 *   // Update the layout based on the current count.
	 *   // In this example, "progress" is a "bar", and "image" is a "pixmap", defined in the layout JSON file.
	 *   streamDeck.setFeedback({
	 *     progress: settings.count,
	 *     image: {
	 *       enabled: settings.count >= 50 // Show the image in the layout when the count is greater than or equal to 50
	 *     }
	 *   })
	 * });
	 */
	public setFeedback(context: string, feedback: FeedbackPayload): Promise<void> {
		return this.send("setFeedback", {
			context,
			payload: feedback
		});
	}

	/**
	 * Sets the layout associated with an action instance, as identified by the `context`. The layout must be either a built-in layout identifier, or path to a local layout JSON file within the plugin's folder.
	 * Use in conjunction with {@link StreamDeck.setFeedback} to update the layouts current settings once it has been changed.
	 * @param context Unique identifier of the action instance whose layout will be updated.
	 * @param layout New layout being assigned to the action instance.
	 * @returns `Promise` resolved when the new layout has been sent to Stream Deck.
	 * @example
	 * streamDeck.on("dialDown", data => {
	 *   // Set the layout to the built-in $B1 on dial down.
	 *   streamDeck.setFeedbackLayout(data.context, "$X1");
	 * });
	 * @example
	 * streamDeck.on("dialDown", data => {
	 *   // Set the layout to the custom layout, defined in the local file, on dial down.
	 *   streamDeck.setFeedbackLayout(data.context, "layouts/MyCustomLayout.json");
	 * });
	 */
	public setFeedbackLayout(context: string, layout: string): Promise<void> {
		return this.send("setFeedbackLayout", {
			context,
			payload: {
				layout
			}
		});
	}

	/**
	 * Sets the global `settings` associated the plugin. **Note**, these settings are only available to this plugin, and should be used to persist information securely.
	 * Use conjunction with {@link StreamDeck.getGlobalSettings}.
	 * @param settings Settings to save.
	 * @returns `Promise` resolved when the global `settings` are sent to Stream Deck.
	 * @example
	 * streamDeck.setGlobalSettings({
	 *   apiKey,
	 *   connectedDate: new Date()
	 * })
	 */
	public setGlobalSettings(settings: unknown): Promise<void> {
		return this.send("setGlobalSettings", {
			context: this.pluginUUID,
			payload: settings
		});
	}

	/**
	 * Sets the `image` displayed for an instance of an action, as identified by the `context`.
	 * @param context Unique identifier of the action instance whose image will be updated.
	 * @param image Image to display; this can be either a path to a local file within the plugin's folder, a base64 encoded `string` with the mime type declared (e.g. PNG, JPEG, etc.), or an SVG `string`. When `image` is `undefined`, the image from the manifest is used.
	 * @param target Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
	 * @param state Action state the request applies to; when no state is supplied, the image is set for both states. **Note**, only applies to multi-state actions.
	 * @returns `Promise` resolved when the request to set the `image` has been sent to Stream Deck.
	 * @example
	 * // Set the image from a local path when a specific action appears.
	 * streamDeck.on("willAppear", data => {
	 *   if (data.action === "com.elgato.plugin.myAction") {
	 *     streamDeck.setImage(data.context, "imgs/Logo.png");
	 *   }
	 * });
	 * @example
	 * // Set the image, but only on the hardware device, from a base64 encoded string when a key is pressed down.
	 * streamDeck.on("keyDown", data => {
	 *   streamDeck.setImage(data.context, "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MHB0IiBoZWlnaHQ9…", Target.Hardware);
	 * });
	 */
	public setImage(context: string, image: string, target: Target = Target.HardwareAndSoftware, state: 0 | 1 | null = null): Promise<void> {
		return this.send("setImage", {
			context,
			payload: {
				image,
				target,
				state
			}
		});
	}

	/**
	 * Sets the `settings` associated with an instance of an action, as identified by the `context`. An instance of an action represents a button, dial, pedal, etc.
	 * Use in conjunction with {@link StreamDeck.getSettings}.
	 * @param context Unique identifier of the action instance whose settings will be updated.
	 * @param settings Settings to associate with the action instance.
	 * @returns `Promise` resolved when the `settings` are sent to Stream Deck.
	 */
	public setSettings(context: string, settings: unknown): Promise<void> {
		return this.send("setSettings", {
			context,
			payload: settings
		});
	}

	/**
	 * Sets the current state of an action instance; this only applies to actions that have multiple states defined within the manifest.json file.
	 * @param context Unique identifier of the action instance who state will be set.
	 * @param state State to set; this be either 0, or 1.
	 * @returns `Promise` resolved when the request to set the state of an action instance has been sent to Stream Deck.
	 * @example
	 * audioService.on("deviceEnabledStateChanged", device => {
	 *   streamDeck.setState(context, device.isEnabled ? 1 : 0);
	 * });
	 */
	public setState(context: string, state: 0 | 1): Promise<void> {
		return this.send("setState", {
			context,
			payload: {
				state
			}
		});
	}

	/**
	 * Sets the `title` displayed for an instance of an action, as identified by the `context`. Often used in conjunction with `"titleParametersDidChange"` event.
	 * @param context Unique identifier of the action instance whose title will be updated.
	 * @param title Title to display; when no title is specified, the title will reset to the title set by the user.
	 * @param target Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
	 * @param state Action state the request applies to; when no state is supplied, the title is set for both states. **Note**, only applies to multi-state actions.
	 * @returns `Promise` resolved when the request to set the `title` has been sent to Stream Deck.
	 * @example
	 * // Set the title to "Hello world" when the action appears.
	 * streamDeck.on("willAppear", data => {
	 *   streamDeck.setTitle(data.context, "Hello world");
	 * });
	 */
	public setTitle(context: string, title?: string, target?: Target, state?: 0 | 1): Promise<void> {
		return this.send("setTitle", {
			context,
			payload: {
				title,
				target,
				state
			}
		});
	}

	/**
	 * Temporarily shows an alert (i.e. warning), in the form of an exclamation mark in a yellow triangle, on an action, as identified by the `context`. Used to provide visual feedback when an action failed.
	 * Use in conjunction with {@link StreamDeck.logger} to log errors.
	 * @param context Unique identifier of the action instance where the warning will be shown.
	 * @returns `Promise` resolved when the request to show an alert has been sent to Stream Deck.
	 * @example
	 * streamDeck.on("keyDown", async data => {
	 *   try {
	 *     myOtherService.doSomethingThatWillBreak();
	 *   } catch(e) {
	 *     // Log the error, and show an alert to the user.
	 *     streamDeck.logger.error("My service failed", e);
	 *     await streamDeck.showAlert(data.context);
	 *   }
	 * })
	 */
	public showAlert(context: string): Promise<void> {
		return this.send("showAlert", {
			context
		});
	}

	/**
	 * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on an action, as identified by the `context`. Used to provide visual feedback when an action successfully executed.
	 * @param context Unique identifier of the action instance where the "OK" will be shown.
	 * @returns `Promise` resolved when the request to show an "OK" has been sent to Stream Deck.
	 * @example
	 * streamDeck.on("keyDown", async data => {
	 *   // Show success check-mark after executing something.
	 *   myService.doSomething();
	 *   await streamDeck.showOk(data.context);
	 * })
	 */
	public showOk(context: string): Promise<void> {
		return this.send("showOk", {
			context
		});
	}

	/**
	 * Requests the Stream Deck switches the current profile of the specified `device`, to the profile defined by `profile`. **Note**, plugins can only switch to profiles included as part of the plugin, and
	 * defined within their manifest.json. Plugins cannot switch to custom profiles created by users.
	 * @param profile Name of the profile to switch to. The name must be identical to the one provided in the manifest.json file.
	 * @param device Unique identifier of the device where the profile should be set.
	 * @returns `Promise` resolved when the request to switch the `profile` has been sent to Stream Deck.
	 */
	public switchToProfile(profile: string, device: string): Promise<void> {
		return this.send("switchToProfile", {
			context: this.pluginUUID,
			device,
			payload: {
				profile
			}
		});
	}

	/**
	 * Propagates the event emitted by the Stream Deck's web socket connection, to the event emitter used by the plugin.
	 * @param event Event message received from the Stream Deck.
	 */
	private propagateMessage(event: WebSocket.MessageEvent) {
		if (typeof event.data === "string") {
			const message = JSON.parse(event.data);
			if (message.event) {
				logger.trace(event.data);
				this.eventEmitter.emit(message.event, message);
			}
		}
	}

	/**
	 * Sends the messages to the Stream Deck, once the connection has been established and the plugin registered.
	 * @param event Event name where the message will be sent.
	 * @param data Data to send to Stream Deck.
	 * @returns `Promise` resolved when the request is sent to Stream Deck.
	 */
	private async send(event: OutboundEvents, data: object): Promise<void> {
		const connection = await this.connection.promise;
		const message = JSON.stringify({
			event,
			...data
		});

		logger.trace(message);
		connection.send(message);
	}
}

export default new StreamDeck();
