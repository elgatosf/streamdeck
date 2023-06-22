/**
 * Represents an event that is emitted from, or sent to, the Stream Deck.
 */
export type StreamDeckEvent<TEvent> = {
	/**
	 * Name of the event used to identify what occurred, or what is being requested.
	 */
	event: TEvent;
};

/**
 * Provides information for an event relating to an action, e.g. `willAppear`, `keyDown`, etc.
 */
export type StreamDeckActionEvent<TEvent> = StreamDeckEvent<TEvent> & {
	/**
	 * Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
	 */
	action: string;

	/**
	 * Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and
	 * request settings associated with the action instance, etc.
	 */
	context: string;

	/**
	 * Unique identifier of the Stream Deck device that this event is associated with.
	 */
	device: string;
};

/**
 * Provides information for an event relating to an action, e.g. `willAppear`, `keyDown`, etc.
 */
export type StreamDeckActionEventWithPayload<TEvent, TPayload> = StreamDeckActionEvent<TEvent> & {
	/**
	 * Additional information about the action and the event.
	 */
	payload: TPayload;
};

/**
 * Occurs when the plugin receives settings, for a specific action instance, from the Stream Deck.
 */
export type DidReceiveSettingsEvent<TSettings = unknown> = StreamDeckActionEventWithPayload<
	"didReceiveSettings",
	{
		settings: TSettings;
		coordinates: Coordinates;
		isInMultiAction: boolean;
	}
>;

/**
 * Occurs when the plugin receives the global settings from the Stream Deck.
 */
export type DidReceiveGlobalSettingsEvent<TSettings = unknown> = {
	/**
	 * Name of the event that occurred; in the context of this event, this is always "didReceiveGlobalSettings".
	 */
	event: "didReceiveGlobalSettings";
	payload: {
		settings: TSettings;
	};
};

export type TouchTapEvent<TSetting = unknown> = StreamDeckActionEventWithPayload<
	"touchTap",
	{
		coordinates: Coordinates;
		hold: boolean;
		settings: TSetting;
		tapPos: [number, number];
	}
>;

export type DialDownEvent<TSetting = unknown> = StreamDeckActionEventWithPayload<
	"dialDown",
	{
		controller: Extract<Controller, "Encoder">;
		coordinates: Coordinates;
		settings: TSetting;
	}
>;

export type DialUpEvent<TSetting = unknown> = StreamDeckActionEventWithPayload<"dialUp", DialDownEvent<TSetting>["payload"]>;

export type DialRotateEvent<TSetting = unknown> = StreamDeckActionEventWithPayload<
	"dialRotate",
	{
		controller: Extract<Controller, "Encoder">;
		coordinates: Coordinates;
		pressed: boolean;
		settings: TSetting;
		ticks: number;
	}
>;

export type KeyDownEvent<TSetting = unknown> = StreamDeckActionEventWithPayload<
	"keyDown",
	{
		coordinates: Coordinates;
		isInMultiAction: boolean;
		settings: TSetting;
		state?: State;
		userDesiredState?: State;
	}
>;

export type KeyUpEvent<TSetting = unknown> = StreamDeckActionEventWithPayload<"keyUp", KeyDownEvent<TSetting>["payload"]>;

/**
 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
 * page". An action refers to _all_ types of actions, e.g. keys, dials,
 * touchscreens, pedals, etc.
 */
export type WillAppearEvent<TSetting = unknown> = StreamDeckActionEventWithPayload<
	"willAppear",
	{
		controller: Controller;
		coordinates: Coordinates;
		isInMultiAction: boolean;
		settings: TSetting;
		state?: State;
	}
>;

/**
 * Occurs when an action disappears from the Stream Deck due to the user navigating to another page, profile, folder, etc. An action refers to _all_ types of actions, e.g. keys, dials,
 * touchscreens, pedals, etc.
 */
export type WillDisappearEvent<TSetting = unknown> = StreamDeckActionEventWithPayload<"willDisappear", WillAppearEvent<TSetting>["payload"]>;

export type TitleParametersDidChangeEvent<TSetting = unknown> = StreamDeckActionEventWithPayload<
	"titleParametersDidChange",
	{
		coordinates: Coordinates;
		settings: TSetting;
		state?: State;
		title: string;
		titleParameters: {
			fontFamily: string;
			fontSize: number;
			fontStyle: "" | "Bold" | "Bold Italic" | "Italic" | "Regular";
			fontUnderline: boolean;
			showTitle: boolean;
			titleAlignment: "bottom" | "middle" | "top";
			titleColor: string; // this is a hex value.
		};
	}
>;

export type DeviceDidConnectEvent = {
	/**
	 * Unique identifier of the Stream Deck device that this event is associated with.
	 */
	device: string;

	/**
	 * Information about the newly connected device.
	 */
	deviceInfo: {
		/**
		 * Name of the device, as specified by the user in the Stream Deck application.
		 */
		name: string;

		/**
		 * Number of action slots available to the device. NB. The size denotes keys only.
		 */
		size: Size;

		/**
		 * Type of the device that was connected, e.g. Stream Deck+, Stream Deck Pedal, etc. See {@link DeviceType}.
		 */
		type: DeviceType;
	};

	/**
	 * Name of the event that occurred; in the context of this event, this is always "deviceDidConnect".
	 */
	event: "deviceDidConnect";
};

export type DeviceDidDisconnectEvent = {
	/**
	 * Unique identifier of the Stream Deck device that this event is associated with.
	 */
	device: string;

	/**
	 * Name of the event that occurred; in the context of this event, this is always "deviceDidDisconnect".
	 */
	event: "deviceDidDisconnect";
};

export type ApplicationDidLaunchEvent = {
	/**
	 * Name of the event that occurred; in the context of this event, this is always "applicationDidLaunch".
	 */
	event: "applicationDidLaunch";

	payload: {
		application: string;
	};
};

export type ApplicationDidTerminateEvent = {
	/**
	 * Name of the event that occurred; in the context of this event, this is always "applicationDidTerminate".
	 */
	event: "applicationDidTerminate";

	payload: {
		application: string;
	};
};

export type SystemDidWakeUpEvent = {
	/**
	 * Name of the event that occurred; in the context of this event, this is always "systemDidWakeUp".
	 */
	event: "systemDidWakeUp";
};

/**
 * Occurs when the property inspector appears, i.e. the user selects the action in the Stream Deck application.
 */
export type PropertyInspectorDidAppearEvent = StreamDeckActionEvent<"propertyInspectorDidAppear">;

/**
 * Occurs when the property inspector disappears, i.e. the user unselects the action in the Stream Deck application.
 */
export type PropertyInspectorDidDisappearEvent = StreamDeckActionEvent<"propertyInspectorDidDisappear">;

export type SendToPluginEvent<TPayload extends object = object> = {
	/**
	 * Unique identifier of the action, as defined within the plugin's manifest, i.e. the action's UUID.
	 * @example
	 * "com.elgato.wavelink.mute"
	 */
	action: string;

	/**
	 * Identifies the instance of an action that caused the event, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and
	 * request settings associated with the action instance, etc.
	 * @example
	 * // Shows a temporary "OK" tick on the button that caused the event
	 * streamDeck.showOk(ev.context);
	 */
	context: string;

	/**
	 * Name of the event that occurred; in the context of this event, this is always "sendToPlugin".
	 */
	event: "sendToPlugin";

	/**
	 * Payload send to the plugin from the property inspector.
	 */
	payload: TPayload;
};

/**
 * Controller types that are available as part of Stream Deck devices.
 */
type Controller = "Encoder" | "Keypad";

/**
 * Coordinates that identify the location of an action.
 */
type Coordinates = {
	/**
	 * Column the action instance is located in, indexed from 0.
	 */
	column: number;

	/**
	 * Row the action instance is located on, indexed from 0. *NB* When the device is {@link DeviceType.StreamDeckPlus} the row can be 0 for keys (`Keypad`), and will _always_ be 0
	 * for dials (`Encoder`); to differentiate between actions types, cross-check the value of `controller` found on {@link WillAppearEvent.payload}.
	 */
	row: number;
};

/**
 * Possible states an action can be in. This only applies to actions that have multiple states defined in the plugin's manifest.json file.
 */
type State = 0 | 1;

/**
 * Size of the Stream Deck device.
 */
type Size = {
	/**
	 * Number of columns available on the Stream Deck device.
	 */
	columns: number;

	/**
	 * Number of rows available on the Stream Deck device.
	 */
	rows: number;
};

/**
 * Stream Deck devices.
 */
export enum DeviceType {
	/**
	 * Stream Deck, comprising of 15 buttons in a 5x3 layout.
	 */
	StreamDeck = 0,

	/**
	 * Stream Deck Mini, comprising of 6 buttons in a 3x2 layout.
	 */
	StreamDeckMini = 1,

	/**
	 * Stream Deck XL, comprising of 32 buttons in an 8x4 layout.
	 */
	StreamDeckXL = 2,

	/**
	 * Stream Deck Mobile for iOS and Android.
	 */
	StreamDeckMobile = 3,

	/**
	 * Corsair G Keys, buttons available on selected Corsair keyboards.
	 */
	CorsairGKeys = 4,

	/**
	 * Stream Deck Pedal.
	 */
	StreamDeckPedal = 5,

	/**
	 * Corsair Voyager laptop, comprising 10 buttons in a horizontal line above the keyboard.
	 */
	CorsairVoyager = 6,

	/**
	 * Stream Deck+, comprising of 8 buttons in a 4x2 layout and 4 dials with accompanying touch screen.
	 */
	StreamDeckPlus = 7
}

/**
 * Events sent to the plugin, from the Stream Deck.
 */
export type InboundEvents<TSettings = unknown> =
	| ApplicationDidLaunchEvent
	| ApplicationDidTerminateEvent
	| DeviceDidConnectEvent
	| DeviceDidDisconnectEvent
	| DialDownEvent<TSettings>
	| DialRotateEvent<TSettings>
	| DialUpEvent<TSettings>
	| DidReceiveGlobalSettingsEvent
	| DidReceiveSettingsEvent<TSettings>
	| KeyDownEvent<TSettings>
	| KeyUpEvent<TSettings>
	| PropertyInspectorDidAppearEvent
	| PropertyInspectorDidDisappearEvent
	| SendToPluginEvent
	| SystemDidWakeUpEvent
	| TitleParametersDidChangeEvent<TSettings>
	| TouchTapEvent<TSettings>
	| WillAppearEvent<TSettings>
	| WillDisappearEvent<TSettings>;

/**
 * Events sent from the plugin, to the Stream Deck.
 */
export type OutboundEvents =
	| "getGlobalSettings"
	| "getSettings"
	| "logMessage"
	| "openUrl"
	| "sendToPropertyInspector"
	| "setFeedback"
	| "setFeedbackLayout"
	| "setGlobalSettings"
	| "setImage"
	| "setSettings"
	| "setState"
	| "setTitle"
	| "showAlert"
	| "showOk"
	| "switchToProfile";
