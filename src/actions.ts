import { StreamDeckConnection } from "./connectivity/connection";
import * as events from "./connectivity/events";

/**
 * Action controller capable of updating, and propagating events relating to, actions.
 */
export class ActionController {
	/**
	 * Underlying connection with the Stream Deck.
	 */
	protected connection: StreamDeckConnection;

	/**
	 * Initializes a new instance of the `ActionController` class.
	 * @param arg Connection, or controller that contains an existing connection, that will be used to communicate with the Stream Deck
	 */
	constructor(arg: ActionController | StreamDeckConnection) {
		if (arg instanceof ActionController) {
			this.connection = arg.connection;
		} else {
			this.connection = arg;
		}
	}

	/**
	 * Occurs when the user presses a dial (Stream Deck+). **NB** For key actions see {@link ActionController.onKeyDown}.
	 * @param listener Callback invoked when the event occurs.
	 */
	public onDialDown<TSettings = unknown>(listener: (ev: ActionEvent<events.DialDownEvent<TSettings>>) => void): void {
		this.connection.on("dialDown", (ev: events.DialDownEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user rotates a dial (Stream Deck+).
	 * @param listener Callback invoked when the event occurs.
	 */
	public onDialRotate<TSettings = unknown>(listener: (ev: ActionEvent<events.DialRotateEvent<TSettings>>) => void): void {
		this.connection.on("dialRotate", (ev: events.DialRotateEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user releases a pressed dial (Stream Deck+). **NB** For key actions see {@link ActionController.onKeyUp}.
	 * @param listener Callback invoked when the event occurs.
	 */
	public onDialUp<TSettings = unknown>(listener: (ev: ActionEvent<events.DialUpEvent<TSettings>>) => void): void {
		this.connection.on("dialUp", (ev: events.DialUpEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the settings associated with an action instance are requested using `streamDeck.getSettings(context)`, or when the the settings were updated by the property inspector.
	 * @param listener Callback invoked when the event occurs.
	 */
	public onDidReceiveSettings<TSettings = unknown>(listener: (ev: ActionEvent<events.DidReceiveSettingsEvent<TSettings>>) => void): void {
		this.connection.on("didReceiveSettings", (ev: events.DidReceiveSettingsEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user presses a action down. **NB** For dials / touchscreens see {@link ActionController.onDialDown}.
	 * @param listener Callback invoked when the event occurs.
	 */
	public onKeyDown<TSettings = unknown>(listener: (ev: ActionEvent<events.KeyDownEvent<TSettings>>) => void): void {
		this.connection.on("keyDown", (ev: events.KeyDownEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user releases a pressed action. **NB** For dials / touchscreens see {@link ActionController.onDialUp}.
	 * @param listener Callback invoked when the event occurs.
	 */
	public onKeyUp<TSettings = unknown>(listener: (ev: ActionEvent<events.KeyUpEvent<TSettings>>) => void): void {
		this.connection.on("keyUp", (ev: events.KeyUpEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the property inspector associated with the action becomes visible; occurs when the user selects the action in the Stream Deck application. Also see {@link ActionController.onPropertyInspectorDidDisappear}.
	 * @param listener Callback invoked when the event occurs.
	 */
	public onPropertyInspectorDidAppear(listener: (ev: Event<events.PropertyInspectorDidAppearEvent>) => void): void {
		this.connection.on("propertyInspectorDidAppear", (ev: events.PropertyInspectorDidAppearEvent) => listener(new Event(this, ev)));
	}

	/**
	 * Occurs when the property inspector associated with the action becomes visible; occurs when the user unselects the action in the Stream Deck application. Also see {@link ActionController.onPropertyInspectorDidAppear}.
	 * @param listener Callback invoked when the event occurs.
	 */
	public onPropertyInspectorDidDisappear(listener: (ev: Event<events.PropertyInspectorDidDisappearEvent>) => void): void {
		this.connection.on("propertyInspectorDidDisappear", (ev: events.PropertyInspectorDidDisappearEvent) => listener(new Event(this, ev)));
	}

	/**
	 * Occurs when a message was sent to the plugin _from_ the property inspector. The plugin can also send messages _to_ the property inspector using `streamDeck.sendToPlugin(context, payload)`.
	 * @param listener Callback invoked when the event occurs.
	 */
	public onSendToPlugin<TPayload extends object>(listener: (ev: PropertyInspectorMessageEvent<TPayload>) => void): void {
		this.connection.on("sendToPlugin", (ev: events.SendToPluginEvent<TPayload>) => listener(new PropertyInspectorMessageEvent(this, ev)));
	}

	/**
	 * Occurs when the user updates the title's settings in the Stream Deck application.
	 * @param listener Callback invoked when the event occurs.
	 */
	public onTitleParametersDidChange<TSettings = unknown>(listener: (ev: ActionEvent<events.TitleParametersDidChangeEvent<TSettings>>) => void): void {
		this.connection.on("titleParametersDidChange", (ev: events.TitleParametersDidChangeEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when the user taps the touchscreen (Stream Deck+).
	 * @param listener Callback invoked when the event occurs.
	 */
	public onTouchTap<TSettings = unknown>(listener: (ev: ActionEvent<events.TouchTapEvent<TSettings>>) => void): void {
		this.connection.on("touchTap", (ev: events.TouchTapEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when an action becomes visible on the Stream Deck device.
	 * @param listener Callback invoked when the event occurs.
	 */
	public onWillAppear<TSettings = unknown>(listener: (ev: ActionEvent<events.WillAppearEvent<TSettings>>) => void): void {
		this.connection.on("willAppear", (ev: events.WillAppearEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/**
	 * Occurs when an action is no longer visible on the Stream Deck device.
	 * @param listener Callback invoked when the event occurs.
	 */
	public onWillDisappear<TSettings = unknown>(listener: (ev: ActionEvent<events.WillDisappearEvent<TSettings>>) => void): void {
		this.connection.on("willDisappear", (ev: events.WillDisappearEvent<TSettings>) => listener(new ActionEvent(this, ev)));
	}

	/*
	 * getSettings
	 * sendToPropertyInspector
	 * setFeedback
	 * setFeedbackLayout
	 * setImage
	 * setSettings
	 * setState
	 * setTitle
	 */

	/**
	 * Temporarily shows an "OK" (i.e. success), in the form of a check-mark in a green circle, on an action, as identified by the `context`. Used to provide visual feedback when an
	 * action successfully executed.
	 * @param context Unique identifier of the action instance where the "OK" will be shown.
	 * @returns `Promise` resolved when the request to show an "OK" has been sent to Stream Deck.
	 */
	public showOk(context: string): Promise<void> {
		return this.connection.send("showOk", {
			context: context
		});
	}
}

/**
 * Contextualized `ActionController` that is associated with an instance of an action.
 */
class ContextualizedActionController extends ActionController {
	/**
	 * Initializes a new instance of the `ContextualizedActionController` class.
	 * @param controller Underlying controller that contains the connection responsible for communicating with the Stream Deck.
	 * @param context Unique identifier that identifies the instance of the action.
	 */
	constructor(protected readonly controller: ActionController, public readonly context: string) {
		super(controller);
	}

	/** @inheritdoc */
	public showOk() {
		return super.showOk(this.context);
	}
	/*
	 * getSettings
	 * sendToPropertyInspector
	 * setFeedback
	 * setFeedbackLayout
	 * setImage
	 * setSettings
	 * setState
	 * setTitle
	 */
}

/**
 * An action associated with an event raised by Stream Deck.
 */
class ActionEventSource extends ContextualizedActionController {
	/**
	 * Initializes a new instance of the `ActionEventSource` class.
	 * @param controller Controller capable of updating the action.
	 * @param manifestId Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
	 * @param context Unique identifier of the instance of the action; this can be used to update the action on the Stream Deck, e.g. its title, settings, etc.
	 */
	constructor(controller: ActionController, public readonly manifestId: string, context: string) {
		super(controller, context);
	}
}

/**
 * Provides information for an event that was associated with an action.
 */
class Event<TEvent extends Omit<events.StreamDeckActionEvent<unknown>, "device">> {
	/**
	 * The action that raised the event.
	 */
	public readonly action: OmitEvents<ActionEventSource>;

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
 * Utility type for omitting all "event" based methods that are prefixed with "on".
 */
type OmitEvents<T> = Omit<
	T,
	{
		[K in keyof T]-?: K extends `on${string}` ? K : never;
	}[keyof T]
>;

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
