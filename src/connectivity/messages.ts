/**
 * Represents an event that is emitted from, or sent to, the Stream Deck.
 */
export type Message<T> = {
	/**
	 * Name of the event used to identify what occurred, or what is being requested.
	 */
	event: T;
};

/**
 * Provides information for a message relating to an action, e.g. `willAppear`, `keyDown`, etc.
 */
export type ActionMessage<T> = Message<T> & {
	/**
	 * Unique identifier of the action as defined within the plugin's manifest (`Actions[].UUID`) e.g. "com.elgato.wavelink.mute".
	 */
	action: string;

	/**
	 * Identifies the instance of an action that caused the message, i.e. the specific key or dial. This identifier can be used to provide feedback to the Stream Deck, persist and
	 * request settings associated with the action instance, etc.
	 */
	context: string;

	/**
	 * Unique identifier of the Stream Deck device that this message is associated with.
	 */
	device: string;
};

/**
 * Provides information for a message relating to an action, e.g. `willAppear`, `keyDown`, etc.
 */
export type ActionMessageWithPayload<T, TPayload> = ActionMessage<T> & {
	/**
	 * Additional information about the action and event that occurred, if applicable.
	 */
	payload: TPayload;
};

/**
 * Occurs when the plugin receives settings, for a specific action instance, from the Stream Deck.
 */
export type DidReceiveSettings<TSettings = unknown> = ActionMessageWithPayload<
	"didReceiveSettings",
	{
		coordinates: Coordinates;
		isInMultiAction: boolean;
		settings: TSettings;
	}
>;

/**
 * Occurs when the plugin receives the global settings from the Stream Deck.
 */
export type DidReceiveGlobalSettings<TSettings = unknown> = {
	/**
	 * Name of the event that occurred; in the context of this event, this is always "didReceiveGlobalSettings".
	 */
	event: "didReceiveGlobalSettings";
	payload: {
		settings: TSettings;
	};
};

export type TouchTap<TSetting = unknown> = ActionMessageWithPayload<
	"touchTap",
	{
		coordinates: Coordinates;
		hold: boolean;
		settings: TSetting;
		tapPos: [number, number];
	}
>;

export type DialDown<TSetting = unknown> = ActionMessageWithPayload<
	"dialDown",
	{
		controller: Extract<Controller, "Encoder">;
		coordinates: Coordinates;
		settings: TSetting;
	}
>;

export type DialUp<TSetting = unknown> = ActionMessageWithPayload<"dialUp", DialDown<TSetting>["payload"]>;

export type DialRotate<TSetting = unknown> = ActionMessageWithPayload<
	"dialRotate",
	{
		controller: Extract<Controller, "Encoder">;
		coordinates: Coordinates;
		pressed: boolean;
		settings: TSetting;
		ticks: number;
	}
>;

export type KeyDown<TSetting = unknown> = ActionMessageWithPayload<
	"keyDown",
	{
		coordinates: Coordinates;
		isInMultiAction: boolean;
		settings: TSetting;
		state?: State;
		userDesiredState?: State;
	}
>;

export type KeyUp<TSetting = unknown> = ActionMessageWithPayload<"keyUp", KeyDown<TSetting>["payload"]>;

/**
 * Occurs when an action appears on the Stream Deck due to the user navigating to another page, profile, folder, etc. This also occurs during startup if the action is on the "front
 * page". An action refers to _all_ types of actions, e.g. keys, dials,
 * touchscreens, pedals, etc.
 */
export type WillAppear<TSetting = unknown> = ActionMessageWithPayload<
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
export type WillDisappear<TSetting = unknown> = ActionMessageWithPayload<"willDisappear", WillAppear<TSetting>["payload"]>;

export type TitleParametersDidChange<TSetting = unknown> = ActionMessageWithPayload<
	"titleParametersDidChange",
	{
		coordinates: Coordinates;
		settings: TSetting;
		state?: State;
		title: string;
		titleParameters: {
			fontFamily: string;
			fontSize: number;
			fontStyle: "" | "Bold Italic" | "Bold" | "Italic" | "Regular";
			fontUnderline: boolean;
			showTitle: boolean;
			titleAlignment: "bottom" | "middle" | "top";
			titleColor: string; // this is a hex value.
		};
	}
>;

export type DeviceDidConnect = {
	/**
	 * Unique identifier of the Stream Deck device that this message is associated with.
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

export type DeviceDidDisconnect = {
	/**
	 * Unique identifier of the Stream Deck device that this message is associated with.
	 */
	device: string;

	/**
	 * Name of the event that occurred; in the context of this event, this is always "deviceDidDisconnect".
	 */
	event: "deviceDidDisconnect";
};

export type ApplicationDidLaunch = {
	/**
	 * Name of the event that occurred; in the context of this event, this is always "applicationDidLaunch".
	 */
	event: "applicationDidLaunch";

	payload: {
		application: string;
	};
};

export type ApplicationDidTerminate = {
	/**
	 * Name of the event that occurred; in the context of this event, this is always "applicationDidTerminate".
	 */
	event: "applicationDidTerminate";

	payload: {
		application: string;
	};
};

export type SystemDidWakeUp = {
	/**
	 * Name of the event that occurred; in the context of this event, this is always "systemDidWakeUp".
	 */
	event: "systemDidWakeUp";
};

/**
 * Occurs when the property inspector appears, i.e. the user selects the action in the Stream Deck application.
 */
export type PropertyInspectorDidAppear = ActionMessage<"propertyInspectorDidAppear">;

/**
 * Occurs when the property inspector disappears, i.e. the user unselects the action in the Stream Deck application.
 */
export type PropertyInspectorDidDisappear = ActionMessage<"propertyInspectorDidDisappear">;

/**
 * Occurs when the property inspector sends a message to the plugin.
 */
export type SendToPlugin<TPayload extends object = object> = Omit<ActionMessage<"sendToPlugin">, "device"> & {
	/**
	 * Payload sent to the plugin from the property inspector.
	 */
	payload: TPayload;
};

/**
 * Controller types that are available as part of Stream Deck devices.
 */
export type Controller = "Encoder" | "Keypad";

/**
 * Coordinates that identify the location of an action.
 */
export type Coordinates = {
	/**
	 * Column the action instance is located in, indexed from 0.
	 */
	column: number;

	/**
	 * Row the action instance is located on, indexed from 0. *NB* When the device is {@link DeviceType.StreamDeckPlus} the row can be 0 for keys (`Keypad`), and will _always_ be 0
	 * for dials (`Encoder`); to differentiate between actions types, cross-check the value of `controller` found on {@link WillAppear.payload}.
	 */
	row: number;
};

/**
 * Possible states an action can be in. This only applies to actions that have multiple states defined in the plugin's manifest.json file.
 */
export type State = 0 | 1;

/**
 * Size of the Stream Deck device.
 */
export type Size = {
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
 * s sent to the plugin, from the Stream Deck.
 */
export type InboundMessages<TSettings = unknown> =
	| ApplicationDidLaunch
	| ApplicationDidTerminate
	| DeviceDidConnect
	| DeviceDidDisconnect
	| DialDown<TSettings>
	| DialRotate<TSettings>
	| DialUp<TSettings>
	| DidReceiveGlobalSettings
	| DidReceiveSettings<TSettings>
	| KeyDown<TSettings>
	| KeyUp<TSettings>
	| PropertyInspectorDidAppear
	| PropertyInspectorDidDisappear
	| SendToPlugin
	| SystemDidWakeUp
	| TitleParametersDidChange<TSettings>
	| TouchTap<TSettings>
	| WillAppear<TSettings>
	| WillDisappear<TSettings>;

/**
 * s sent from the plugin, to the Stream Deck.
 */
export type OutboundMessages =
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
