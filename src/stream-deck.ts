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
	 * @returns Promise resolved when the request to open the `url` has been sent to Stream Deck.
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
	 * Sets the global `settings` associated the plugin. **Note**, these settings are only available to this plugin, and should be used to persist information securely. Use in conjunction with {@link StreamDeck.getGlobalSettings}.
	 * @param settings Settings to save.
	 * @returns Promise resolved when the global `settings` are sent to Stream Deck.
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
	 * @param image Image to display; this can be either a path to a local file within the plugin's folder, or a base64 encoded `string`. When `image` is `undefined`, the image from the manifest is used.
	 * @param target Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
	 * @param state Action state the request applies to; when no state is supplied, the image is set for both states. **Note**, only applies to multi-state actions.
	 * @returns Promise resolved when the request to set the `image` has been sent to Stream Deck.
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
	 * Sets the `settings` associated with an instance of an action, as identified by the `context`. An instance of an action represents a button, dial, pedal, etc. Use in conjunction with {@link StreamDeck.getSettings}.
	 * @param context Unique identifier of the action instance whose settings will be updated.
	 * @param settings Settings to associate with the action instance.
	 * @returns Promise resolved when the `settings` are sent to Stream Deck.
	 */
	public setSettings(context: string, settings: unknown): Promise<void> {
		return this.send("setSettings", {
			context,
			payload: settings
		});
	}

	// TODO: Should we include this, or continue to expose the `StreamDeck.logger`?
	public logMessage(message: string): Promise<void> {
		return this.send("logMessage", {
			payload: {
				message
			}
		});
	}

	/**
	 * Sets the `title` displayed for an instance of an action, as identified by the `context`. Often used in conjunction with `"titleParametersDidChange"` event.
	 * @param context Unique identifier of the action instance whose title will be updated.
	 * @param title Title to display; when no title is specified, the title will reset to the title set by the user.
	 * @param target Specifies which aspects of the Stream Deck should be updated, hardware, software, or both.
	 * @param state Action state the request applies to; when no state is supplied, the title is set for both states. **Note**, only applies to multi-state actions.
	 * @returns Promise resolved when the request to set the `title` has been sent to Stream Deck.
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

	public setFeedback(context: string, feedback: FeedbackPayload): Promise<void> {
		return this.send("setFeedback", {
			context,
			payload: feedback
		});
	}

	public setFeedbackLayout(context: string, layout: string): Promise<void> {
		return this.send("setFeedbackLayout", {
			context,
			payload: {
				layout
			}
		});
	}

	public showAlert(context: string): Promise<void> {
		return this.send("showAlert", {
			context
		});
	}

	public showOk(context: string): Promise<void> {
		return this.send("showOk", {
			context
		});
	}

	public setState(context: string, state: 0 | 1 | null = null): Promise<void> {
		return this.send("setState", {
			context,
			payload: {
				state
			}
		});
	}
	public switchToProfile(profile: string): Promise<void> {
		return this.send("switchToProfile", {
			context: this.pluginUUID,
			payload: {
				profile
			}
		});
	}

	public sendToPropertyInspector(context: string, payload: unknown): Promise<void> {
		return this.send("sendToPropertyInspector", {
			context,
			payload
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
