import { StreamDeckConnection } from "./connectivity/connection";
import * as messages from "./connectivity/messages";
import { ActionController, Target } from "./controllers";
import { Device } from "./devices";
import { ActionEvent, ActionWithoutPayloadEvent, ApplicationEvent, DeviceEvent, SendToPluginEvent, SettingsEvent } from "./events";
import { FeedbackPayload } from "./layouts";
import logger from "./logger";
import { Manifest } from "./manifest";
import { PromiseCompletionSource } from "./promises";

/**
 * Provides the main bridge between the plugin and the Stream Deck allowing the plugin to send requests and receive events, e.g. when the user presses an action.
 */
export class StreamDeckClient implements ActionController {
	/**
	 * Initializes a new instance of the `StreamDeckClient`.
	 * @param connection Underlying connection with the Stream Deck.
	 * @param devices Device collection responsible for tracking devices.
	 */
	constructor(public readonly connection: StreamDeckConnection, private readonly devices: ReadonlyMap<string, Device>) {}

	/**
	 * Gets the logger used by this instance, used to log messages independently of a Stream Deck connection.
	 * @returns The logger.
	 */
	public get logger() {
		return logger;
	}

	/**
	 * Gets the global settings associated with the plugin. Use in conjunction with {@link StreamDeckClient.setGlobalSettings}.
	 * @returns Promise containing the plugin's global settings.
	 */
	public async getGlobalSettings<T = unknown>(): Promise<T> {
		const settings = new PromiseCompletionSource<T>();
		this.connection.once("didReceiveGlobalSettings", (msg: messages.DidReceiveGlobalSettings<T>) => settings.setResult(msg.payload.settings));

		await this.connection.send("getGlobalSettings", {
			context: this.connection.registrationParameters.pluginUUID
		});

		return settings.promise;
	}

	/** @inheritdoc */
	public async getSettings<T = unknown>(context: string): Promise<T> {
		const settings = new PromiseCompletionSource<T>();
		const callback = (msg: messages.DidReceiveSettings<T>) => {
			if (msg.context == context) {
				settings.setResult(msg.payload.settings);
				this.connection.removeListener("didReceiveSettings", callback);
			}
		};

		this.connection.on("didReceiveSettings", callback);
		await this.connection.send("getSettings", {
			context
		});

		return settings.promise;
	}

	/**
	 * Occurs when an action becomes visible on the Stream Deck device.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onActionWillAppear<TSettings = unknown>(listener: (ev: ActionEvent<messages.WillAppear<TSettings>>) => void): void {
		this.connection.on("willAppear", (ev: messages.WillAppear<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when an action is no longer visible on the Stream Deck device.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onActionWillDisappear<TSettings = unknown>(listener: (ev: ActionEvent<messages.WillDisappear<TSettings>>) => void): void {
		this.connection.on("willDisappear", (ev: messages.WillDisappear<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when a monitored application launched. Monitored applications can be defined in the `manifest.json` file via the {@link Manifest.ApplicationsToMonitor} property.
	 * Also see {@link StreamDeckClient.onApplicationDidTerminate}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onApplicationDidLaunch(listener: (ev: ApplicationEvent<messages.ApplicationDidLaunch>) => void): void {
		this.connection.on("applicationDidLaunch", (ev) => listener(new ApplicationEvent(ev)));
	}

	/**
	 * Occurs when a monitored application terminates. Monitored applications can be defined in the `manifest.json` file via the {@link Manifest.ApplicationsToMonitor} property.
	 * Also see {@link StreamDeckClient.onApplicationDidLaunch}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onApplicationDidTerminate(listener: (ev: ApplicationEvent<messages.ApplicationDidTerminate>) => void): void {
		this.connection.on("applicationDidTerminate", (ev) => listener(new ApplicationEvent(ev)));
	}

	/**
	 * Occurs when a Stream Deck device is connected. Also see {@link StreamDeckClient.onDeviceDidConnect}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDeviceDidConnect(listener: (ev: DeviceEvent<messages.DeviceDidConnect, Required<Device>>) => void): void {
		this.connection.on("deviceDidConnect", (ev) =>
			listener(
				new DeviceEvent(ev, {
					id: ev.device,
					isConnected: true,
					...ev.deviceInfo
				})
			)
		);
	}

	/**
	 * Occurs when a Stream Deck device is disconnected. Also see {@link StreamDeckClient.onDeviceDidDisconnect}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDeviceDidDisconnect(listener: (ev: DeviceEvent<messages.DeviceDidDisconnect, Device>) => void): void {
		this.connection.on("deviceDidDisconnect", (ev) =>
			listener(
				new DeviceEvent(
					ev,
					this.devices.get(ev.device) || {
						id: ev.device,
						isConnected: false
					}
				)
			)
		);
	}

	/**
	 * Occurs when the user presses a dial (Stream Deck+). **NB** For key actions see {@link StreamDeckClient.onKeyDown}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialDown<TSettings = unknown>(listener: (ev: ActionEvent<messages.DialDown<TSettings>>) => void): void {
		this.connection.on("dialDown", (ev: messages.DialDown<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user rotates a dial (Stream Deck+).
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialRotate<TSettings = unknown>(listener: (ev: ActionEvent<messages.DialRotate<TSettings>>) => void): void {
		this.connection.on("dialRotate", (ev: messages.DialRotate<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck+). **NB** For key actions see {@link StreamDeckClient.onKeyUp}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialUp<TSettings = unknown>(listener: (ev: ActionEvent<messages.DialUp<TSettings>>) => void): void {
		this.connection.on("dialUp", (ev: messages.DialUp<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the global settings are requested using {@link StreamDeckClient.getGlobalSettings}, or when the the global settings were updated by the property inspector.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveGlobalSettings<TSettings = unknown>(listener: (ev: SettingsEvent<TSettings>) => void): void {
		this.connection.on("didReceiveGlobalSettings", (ev: messages.DidReceiveGlobalSettings<TSettings>) => listener(new SettingsEvent(ev)));
	}

	/**
	 * Occurs when the settings associated with an action instance are requested using {@link StreamDeckClient.getSettings}, or when the the settings were updated by the property inspector.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveSettings<TSettings = unknown>(listener: (ev: ActionEvent<messages.DidReceiveSettings<TSettings>>) => void): void {
		this.connection.on("didReceiveSettings", (ev: messages.DidReceiveSettings<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user presses a action down. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialDown}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyDown<TSettings = unknown>(listener: (ev: ActionEvent<messages.KeyDown<TSettings>>) => void): void {
		this.connection.on("keyDown", (ev: messages.KeyDown<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user releases a pressed action. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialUp}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyUp<TSettings = unknown>(listener: (ev: ActionEvent<messages.KeyUp<TSettings>>) => void): void {
		this.connection.on("keyUp", (ev: messages.KeyUp<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the property inspector associated with the action becomes visible; occurs when the user selects the action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidDisappear}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidAppear(listener: (ev: ActionWithoutPayloadEvent<messages.PropertyInspectorDidAppear>) => void): void {
		this.connection.on("propertyInspectorDidAppear", (ev: messages.PropertyInspectorDidAppear) => listener(new ActionWithoutPayloadEvent(this, ev)));
	}

	/**
	 * Occurs when the property inspector associated with the action becomes visible; occurs when the user unselects the action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidAppear}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidDisappear(listener: (ev: ActionWithoutPayloadEvent<messages.PropertyInspectorDidDisappear>) => void): void {
		this.connection.on("propertyInspectorDidDisappear", (ev: messages.PropertyInspectorDidDisappear) => listener(new ActionWithoutPayloadEvent(this, ev)));
	}

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using `streamDeck.sendToPlugin(context, payload)`.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onSendToPlugin<TPayload extends object>(listener: (ev: SendToPluginEvent<TPayload>) => void): void {
		this.connection.on("sendToPlugin", (ev: messages.SendToPlugin<TPayload>) => listener(new SendToPluginEvent(this, ev)));
	}

	/**
	 * Occurs when the computer wakes up.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onSystemDidWakeUp(listener: () => void) {
		this.connection.on("systemDidWakeUp", () => listener());
	}

	/**
	 * Occurs when the user updates the title's settings in the Stream Deck application.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onTitleParametersDidChange<TSettings = unknown>(listener: (ev: ActionEvent<messages.TitleParametersDidChange<TSettings>>) => void): void {
		this.connection.on("titleParametersDidChange", (ev: messages.TitleParametersDidChange<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck+).
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onTouchTap<TSettings = unknown>(listener: (ev: ActionEvent<messages.TouchTap<TSettings>>) => void): void {
		this.connection.on("touchTap", (ev: messages.TouchTap<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Opens the specified `url` in the user's default browser.
	 * @param url URL to open.
	 * @returns `Promise` resolved when the request to open the `url` has been sent to Stream Deck.
	 */
	public openUrl(url: string): Promise<void> {
		return this.connection.send("openUrl", {
			payload: {
				url
			}
		});
	}

	/** @inheritdoc */
	public sendToPropertyInspector(context: string, payload: unknown): Promise<void> {
		return this.connection.send("sendToPropertyInspector", {
			context,
			payload
		});
	}

	/** @inheritdoc */
	public setFeedback(context: string, feedback: FeedbackPayload): Promise<void> {
		// TODO: Should we rename this to "updateLayout"?
		return this.connection.send("setFeedback", {
			context,
			payload: feedback
		});
	}

	/** @inheritdoc */
	public setFeedbackLayout(context: string, layout: string): Promise<void> {
		// TODO: Should we rename this to simply be "setLayout"?
		return this.connection.send("setFeedbackLayout", {
			context,
			payload: {
				layout
			}
		});
	}

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
	public setGlobalSettings(settings: unknown): Promise<void> {
		return this.connection.send("setGlobalSettings", {
			context: this.connection.registrationParameters.pluginUUID,
			payload: settings
		});
	}

	/** @inheritdoc */
	public setImage(context: string, image: string, state: 0 | 1 | undefined = undefined, target: Target = Target.HardwareAndSoftware): Promise<void> {
		return this.connection.send("setImage", {
			context,
			payload: {
				image,
				target,
				state
			}
		});
	}

	/** @inheritdoc */
	public setSettings(context: string, settings: unknown): Promise<void> {
		return this.connection.send("setSettings", {
			context,
			payload: settings
		});
	}

	/** @inheritdoc */
	public setState(context: string, state: number): Promise<void> {
		return this.connection.send("setState", {
			context,
			payload: {
				state
			}
		});
	}

	/** @inheritdoc */
	public setTitle(context: string, title?: string, state?: 0 | 1, target?: Target): Promise<void> {
		return this.connection.send("setTitle", {
			context,
			payload: {
				title,
				state,
				target
			}
		});
	}

	/** @inheritdoc */
	public showAlert(context: string): Promise<void> {
		return this.connection.send("showAlert", {
			context
		});
	}

	/** @inheritdoc */
	public showOk(context: string): Promise<void> {
		return this.connection.send("showOk", {
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
		return this.connection.send("switchToProfile", {
			context: this.connection.registrationParameters.pluginUUID,
			device,
			payload: {
				profile
			}
		});
	}
}
