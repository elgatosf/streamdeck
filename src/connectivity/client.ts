import { FeedbackPayload } from "../layouts";
import logger from "../logger";
import { Manifest } from "../manifest";
import { PromiseCompletionSource } from "../promises";
import { StreamDeckConnection } from "./connection";
import { ActionController, ContextualizedActionController, Target } from "./controllers";
import * as events from "./events";

/**
 * Provides the main bridge between the plugin and the Stream Deck allowing the plugin to send requests and receive events, e.g. when the user presses an action.
 */
export class StreamDeckClient implements ActionController {
	/**
	 * Initializes a new instance of the `StreamDeckClient`.
	 * @param connection Underlying connection with the Stream Deck.
	 */
	constructor(public readonly connection: StreamDeckConnection) {}

	/**
	 * Gets the information supplied by Stream Deck during the initial registration procedure of the plugin.
	 * @returns Information about the user's operating system, plugin version, connected devices, etc.
	 */
	public get info() {
		return this.connection.params.info;
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
		return this.connection.params.pluginUUID;
	}

	/**
	 * Gets the global settings associated with the plugin. Use in conjunction with {@link StreamDeckClient.setGlobalSettings}.
	 * @returns Promise containing the plugin's global settings.
	 */
	public async getGlobalSettings<T = unknown>(): Promise<events.DidReceiveGlobalSettingsEvent<T>> {
		const settings = new PromiseCompletionSource<events.DidReceiveGlobalSettingsEvent<T>>();
		this.connection.once("didReceiveGlobalSettings", (data: events.DidReceiveGlobalSettingsEvent<T>) => settings.setResult(data));

		await this.connection.send("getGlobalSettings", {
			context: this.pluginUUID
		});

		return settings.promise;
	}

	/** @inheritdoc */
	public async getSettings<T = unknown>(context: string): Promise<T> {
		const settings = new PromiseCompletionSource<T>();
		const callback = (data: events.DidReceiveSettingsEvent<T>) => {
			if (data.context == context) {
				settings.setResult(data.payload.settings);
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
	public onActionWillAppear<TSettings = unknown>(listener: (ev: ActionEvent<events.WillAppearEvent<TSettings>>) => void): void {
		this.connection.on("willAppear", (ev: events.WillAppearEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when an action is no longer visible on the Stream Deck device.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onActionWillDisappear<TSettings = unknown>(listener: (ev: ActionEvent<events.WillDisappearEvent<TSettings>>) => void): void {
		this.connection.on("willDisappear", (ev: events.WillDisappearEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when a monitored application launched. Monitored applications can be defined in the `manifest.json` file via the {@link Manifest.ApplicationsToMonitor} property.
	 * Also see {@link StreamDeckClient.onApplicationDidTerminate}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onApplicationDidLaunch(listener: (ev: ApplicationEvent<events.ApplicationDidLaunchEvent>) => void): void {
		this.connection.on("applicationDidLaunch", (ev) => listener(new ApplicationEvent(ev)));
	}

	/**
	 * Occurs when a monitored application terminates. Monitored applications can be defined in the `manifest.json` file via the {@link Manifest.ApplicationsToMonitor} property.
	 * Also see {@link StreamDeckClient.onApplicationDidLaunch}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onApplicationDidTerminate(listener: (ev: ApplicationEvent<events.ApplicationDidTerminateEvent>) => void): void {
		this.connection.on("applicationDidTerminate", (ev) => listener(new ApplicationEvent(ev)));
	}

	/**
	 * Occurs when a Stream Deck device is connected. Also see {@link StreamDeckClient.onDeviceDidConnect}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDeviceDidConnect(listener: void): void {
		// TODO:
		throw new Error("Not implemented yet");
	}

	/**
	 * Occurs when a Stream Deck device is disconnected. Also see {@link StreamDeckClient.onDeviceDidDisconnect}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDeviceDidDisconnect(listener: void): void {
		// TODO:
		throw new Error("Not implemented yet");
	}

	/**
	 * Occurs when the user presses a dial (Stream Deck+). **NB** For key actions see {@link StreamDeckClient.onKeyDown}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialDown<TSettings = unknown>(listener: (ev: ActionEvent<events.DialDownEvent<TSettings>>) => void): void {
		this.connection.on("dialDown", (ev: events.DialDownEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user rotates a dial (Stream Deck+).
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialRotate<TSettings = unknown>(listener: (ev: ActionEvent<events.DialRotateEvent<TSettings>>) => void): void {
		this.connection.on("dialRotate", (ev: events.DialRotateEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck+). **NB** For key actions see {@link StreamDeckClient.onKeyUp}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDialUp<TSettings = unknown>(listener: (ev: ActionEvent<events.DialUpEvent<TSettings>>) => void): void {
		this.connection.on("dialUp", (ev: events.DialUpEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the global settings are requested using {@link StreamDeckClient.getGlobalSettings}, or when the the global settings were updated by the property inspector.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveGlobalSettings<TSettings = unknown>(listener: (ev: SettingsEvent<TSettings>) => void): void {
		this.connection.on("didReceiveGlobalSettings", (ev: events.DidReceiveGlobalSettingsEvent<TSettings>) => listener(new SettingsEvent(ev)));
	}

	/**
	 * Occurs when the settings associated with an action instance are requested using {@link StreamDeckClient.getSettings}, or when the the settings were updated by the property inspector.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onDidReceiveSettings<TSettings = unknown>(listener: (ev: ActionEvent<events.DidReceiveSettingsEvent<TSettings>>) => void): void {
		this.connection.on("didReceiveSettings", (ev: events.DidReceiveSettingsEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user presses a action down. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialDown}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyDown<TSettings = unknown>(listener: (ev: ActionEvent<events.KeyDownEvent<TSettings>>) => void): void {
		this.connection.on("keyDown", (ev: events.KeyDownEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user releases a pressed action. **NB** For dials / touchscreens see {@link StreamDeckClient.onDialUp}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onKeyUp<TSettings = unknown>(listener: (ev: ActionEvent<events.KeyUpEvent<TSettings>>) => void): void {
		this.connection.on("keyUp", (ev: events.KeyUpEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the property inspector associated with the action becomes visible; occurs when the user selects the action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidDisappear}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidAppear(listener: (ev: Event<events.PropertyInspectorDidAppearEvent>) => void): void {
		this.connection.on("propertyInspectorDidAppear", (ev: events.PropertyInspectorDidAppearEvent) => listener(new Event(this, ev)));
	}

	/**
	 * Occurs when the property inspector associated with the action becomes visible; occurs when the user unselects the action in the Stream Deck application. Also see {@link StreamDeckClient.onPropertyInspectorDidAppear}.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onPropertyInspectorDidDisappear(listener: (ev: Event<events.PropertyInspectorDidDisappearEvent>) => void): void {
		this.connection.on("propertyInspectorDidDisappear", (ev: events.PropertyInspectorDidDisappearEvent) => listener(new Event(this, ev)));
	}

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using `streamDeck.sendToPlugin(context, payload)`.
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onSendToPlugin<TPayload extends object>(listener: (ev: PropertyInspectorMessageEvent<TPayload>) => void): void {
		this.connection.on("sendToPlugin", (ev: events.SendToPluginEvent<TPayload>) => listener(new PropertyInspectorMessageEvent(this, ev)));
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
	public onTitleParametersDidChange<TSettings = unknown>(listener: (ev: ActionEvent<events.TitleParametersDidChangeEvent<TSettings>>) => void): void {
		this.connection.on("titleParametersDidChange", (ev: events.TitleParametersDidChangeEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck+).
	 * @param listener Function to be invoked when the event occurs.
	 */
	public onTouchTap<TSettings = unknown>(listener: (ev: ActionEvent<events.TouchTapEvent<TSettings>>) => void): void {
		this.connection.on("touchTap", (ev: events.TouchTapEvent<TSettings>) => listener(new ActionEvent(this, ev)));
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
			context: this.pluginUUID,
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
			context: this.pluginUUID,
			device,
			payload: {
				profile
			}
		});
	}
}

/**
 * An action associated with an event raised by Stream Deck.
 */
class ActionEventSource extends ContextualizedActionController {
	/**
	 * Initializes a new instance of the `ActionEventSource` class.
	 * @param controller Controller capable of updating the action.
	 * @param manifestId Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`).
	 * @param context Unique identifier of the instance of the action; this can be used to update the action on the Stream Deck, e.g. its title, settings, etc.
	 */
	constructor(controller: ActionController, public readonly manifestId: string, public readonly context: string) {
		super(controller, context);
	}
}

class BaseEvent<TEvent extends events.StreamDeckEvent<unknown>> {
	public readonly type: TEvent["event"];
	constructor(source: TEvent) {
		this.type = source.event;
	}
}

class SettingsEvent<TSettings = unknown> extends BaseEvent<events.DidReceiveGlobalSettingsEvent<TSettings>> {
	public readonly settings: TSettings;
	constructor(source: events.DidReceiveGlobalSettingsEvent<TSettings>) {
		super(source);
		this.settings = source.payload.settings;
	}
}

class ApplicationEvent<T extends events.ApplicationDidLaunchEvent | events.ApplicationDidTerminateEvent> extends BaseEvent<T> {
	public readonly application: string;
	constructor(source: T) {
		super(source);
		this.application = source.payload.application;
	}
}

/**
 * Provides information for an event that was associated with an action.
 */
class Event<TEvent extends Omit<events.StreamDeckActionEvent<unknown>, "device">> {
	/**
	 * The action that raised the event.
	 */
	public readonly action: ActionEventSource;

	/**
	 * Type of the event that occurred, e.g. `willAppear`, `keyDown`, etc.
	 */
	public readonly type: TEvent["event"];

	/**
	 * Initializes a new instance of the `Event<TEvent>` class.
	 * @param controller Controller capable of updating the action.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(controller: ActionController, source: TEvent) {
		this.type = source.event;
		this.action = new ActionEventSource(controller, source.action, source.context);
	}
}

/**
 * Provides information for an event that was associated with an action., that includes a `device` and `payload`.
 */
class ActionEvent<TEvent extends events.StreamDeckActionEventWithPayload<ExtractEvent<TEvent>, ExtractPayload<TEvent>>> extends Event<TEvent> {
	/**
	 * Unique identifier of the device that the action is associated with.
	 */
	public readonly deviceId: string;

	/**
	 * Provides additional information about the event that occurred, e.g. how many `ticks` the dial was rotated, the current `state` of the action, etc.
	 */
	public readonly payload: ExtractPayload<TEvent>;

	/**
	 * Initializes a new instance of the `ActionEvent<TEvent>` class.
	 * @param controller Controller capable of updating the action.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(controller: ActionController, source: TEvent) {
		super(controller, source);
		this.deviceId = source.device;
		this.payload = source.payload;
	}
}

/**
 * Provides information for an event that was associated with a payload message received from the property inspector.
 */
class PropertyInspectorMessageEvent<TPayload extends object> extends Event<events.SendToPluginEvent<TPayload>> {
	/**
	 * Payload sent from the property inspector.
	 */
	public payload: TPayload;

	/***
	 * Initializes a new instance of the `PropertyInspectorMessageEvent<TPayload>` class.
	 * @param controller Controller capable of updating the action.
	 * @param source Source of the event, i.e. the original message from Stream Deck.
	 */
	constructor(controller: ActionController, source: events.SendToPluginEvent<TPayload>) {
		super(controller, source);
		this.payload = source.payload;
	}
}

/**
 * Utility type for extracting the event from the specified `T` type.
 */
type ExtractEvent<T> = T extends events.StreamDeckEvent<infer TEvent> ? TEvent : never;

/**
 * Utility type for extracting the payload type from the specified `T` type.
 */
type ExtractPayload<T> = T extends {
	/**
	 * Payload supplied with the event.
	 */
	payload: infer TPayload;
}
	? TPayload
	: never;
