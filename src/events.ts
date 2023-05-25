import { DeviceType } from "./enums";

export type StreamDeckEvent<TEvent> = {
	event: TEvent;
};

/**
 * Occurs when the plugin receives settings, for a specific action instance, from the Stream Deck.
 */
export type DidReceiveSettingsEvent<TSettings = unknown> = {
	action: string;
	event: "didReceiveSettings";
	context: string;
	device: string;
	payload: {
		settings: TSettings;
		coordinates: Coordinates;
		isInMultiAction: boolean;
	};
};

/**
 * Occurs when the plugin receives the global settings from the Stream Deck.
 */
export type DidReceiveGlobalSettingsEvent<TSettings = unknown> = {
	event: "didReceiveGlobalSettings";
	payload: {
		settings: TSettings;
	};
};

export type TouchTapEvent<TSetting = unknown> = {
	action: string;
	event: "touchTap";
	context: string;
	device: string;
	payload: {
		coordinates: Coordinates;
		hold: boolean;
		settings: TSetting;
		tapPos: [number, number];
	};
};

export type DialDownEvent<TSetting = unknown> = {
	action: string;
	event: "dialDown";
	context: string;
	device: string;
	payload: {
		controller: "Encoder";
		coordinates: Coordinates;
		settings: TSetting;
	};
};

export type DialUpEvent<TSetting = unknown> = {
	action: string;
	event: "dialUp";
	context: string;
	device: string;
	payload: {
		controller: "Encoder";
		coordinates: Coordinates;
		settings: TSetting;
	};
};

export type DialRotateEvent<TSetting = unknown> = {
	action: string;
	event: "dialRotate";
	context: string;
	device: string;
	payload: {
		coordinates: Coordinates;
		pressed: boolean;
		settings: TSetting;
		ticks: number;
	};
};

export type KeyDownEvent<TSetting = unknown> = {
	action: string;
	event: "keyDown";
	context: string;
	device: string;
	payload: {
		coordinates: Coordinates;
		isInMultiAction: boolean;
		settings: TSetting;
		state?: State;
		userDesiredState?: State;
	};
};

export type KeyUpEvent<TSetting = unknown> = {
	action: string;
	event: "keyUp";
	context: string;
	device: string;
	payload: {
		coordinates: Coordinates;
		isInMultiAction: boolean;
		settings: TSetting;
		state?: State;
		userDesiredState?: State;
	};
};

export type WillAppearEvent<TSetting = unknown> = {
	action: string;
	event: "willAppear";
	context: string;
	device: string;
	payload: {
		coordinates: Coordinates;
		isInMultiAction: boolean;
		settings: TSetting;
		state?: State;
	};
};

export type WillDisappearEvent<TSetting = unknown> = {
	action: string;
	event: "willDisappear";
	context: string;
	device: string;
	payload: {
		coordinates: Coordinates;
		isInMultiAction: false;
		settings: TSetting;
		state?: State;
	};
};

export type TitleParametersDidChangeEvent<TSetting = unknown> = {
	action: string;
	event: "titleParametersDidChange";
	context: string;
	device: string;
	payload: {
		coordinates: Coordinates;
		settings: TSetting;
		state?: State;
		title: string;
		titleParameters: {
			fontFamily: string;
			fontSize: number;
			fontStyle: string; // ???
			fontUnderline: boolean;
			showTitle: boolean;
			titleAlignment: "bottom" | "middle" | "top";
			titleColor: string;
		};
	};
};
export type DeviceDidConnectEvent = {
	event: "deviceDidConnect";
	device: string;
	deviceInfo: {
		name: string;
		size: Size;
		type: DeviceType;
	};
};
export type DeviceDidDisconnectEvent = {
	event: "deviceDidDisconnect";
	device: string;
};

export type ApplicationDidLaunchEvent = {
	event: "applicationDidLaunch";
	payload: {
		application: string;
	};
};

export type applicationDidTerminateEvent = {
	event: "applicationDidTerminate";
	payload: {
		application: string;
	};
};
export type SystemDidWakeUpEvent = {
	event: "systemDidWakeUp";
};

export type PropertyInspectorDidAppearEvent = {
	action: string;
	event: "propertyInspectorDidAppear";
	context: string;
	device: string;
};

export type PropertyInspectorDidDisappearEvent = {
	action: string;
	event: "propertyInspectorDidDisappear";
	context: string;
	device: string;
};

export type SendToPluginEvent<TPayload = unknown> = {
	action: string;
	event: "sendToPlugin";
	context: string;
	payload: TPayload;
};

type State = 0 | 1;
type Coordinates = {
	column: number;
	row: number;
};

type Size = {
	columns: number;
	rows: number;
};

/**
 * Events sent to the plugin, from the Stream Deck.
 */
export type InboundEvents =
	| DidReceiveGlobalSettingsEvent
	| DidReceiveSettingsEvent
	| KeyDownEvent
	| KeyUpEvent
	| TouchTapEvent
	| DialDownEvent
	| DialUpEvent
	| DialRotateEvent
	| WillAppearEvent
	| WillDisappearEvent
	| TitleParametersDidChangeEvent
	| DeviceDidConnectEvent
	| DeviceDidDisconnectEvent
	| ApplicationDidLaunchEvent
	| applicationDidTerminateEvent
	| SystemDidWakeUpEvent
	| PropertyInspectorDidAppearEvent
	| PropertyInspectorDidDisappearEvent
	| SendToPluginEvent;

/**
 * Events sent from the plugin, to the Stream Deck.
 */
export type OutboundEvents =
	| "getGlobalSettings"
	| "getSettings"
	| "logMessage"
	| "openUrl"
	| "sendToPropertyInspector"
	| "setGlobalSettings"
	| "setFeedback"
	| "setFeedbackLayout"
	| "setImage"
	| "setSettings"
	| "setState"
	| "setTitle"
	| "showAlert"
	| "showOk"
	| "switchToProfile";
