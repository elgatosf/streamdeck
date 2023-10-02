import { DeviceType } from "../device-info";
import type * as events from "../events";

const action = "com.elgato.test.one";
const context = "context123";
const device = "device123";

/**
 * Mocked {@link events.ApplicationDidLaunch} message.
 */
export const applicationDidLaunch: events.ApplicationDidLaunch = {
	event: "applicationDidLaunch",
	payload: {
		application: "notepad.exe"
	}
};

/**
 * Mocked {@link events.ApplicationDidTerminate} message.
 */
export const applicationDidTerminate: events.ApplicationDidTerminate = {
	event: "applicationDidTerminate",
	payload: {
		application: "cmd.exe"
	}
};

/**
 * Mocked {@link events.DeviceDidConnect} message.
 */
export const deviceDidConnect: events.DeviceDidConnect = {
	event: "deviceDidConnect",
	device,
	deviceInfo: {
		name: "Test Device",
		size: {
			columns: 8,
			rows: 4
		},
		type: DeviceType.StreamDeckXL
	}
};

/**
 * Mocked {@link events.DeviceDidConnect} message.
 */
export const deviceDidDisconnect: events.DeviceDidDisconnect = {
	event: "deviceDidDisconnect",
	device
};

/**
 * Mocked {@link events.DialDown} message.
 */
export const dialDown: events.DialDown<Settings> = {
	event: "dialDown",
	action,
	context,
	device,
	payload: {
		controller: "Encoder",
		coordinates: {
			column: 3,
			row: 0
		},
		settings: {
			name: "Elgato"
		}
	}
};

/**
 * Mocked {@link events.DialRotate} message.
 */
export const dialRotate: events.DialRotate<Settings> = {
	event: "dialRotate",
	action,
	context,
	device,
	payload: {
		controller: "Encoder",
		coordinates: {
			column: 3,
			row: 0
		},
		pressed: true,
		settings: {
			name: "Elgato"
		},
		ticks: -2
	}
};

/**
 * Mocked {@link events.DialUp} message.
 */
export const dialUp: events.DialUp<Settings> = {
	...dialDown,
	event: "dialUp"
};

/**
 * Mocked {@link events.DidReceiveGlobalSettings} message.
 */
export const didReceiveGlobalSettings: events.DidReceiveGlobalSettings<Settings> = {
	event: "didReceiveGlobalSettings",
	payload: {
		settings: {
			name: "Elgato"
		}
	}
};

/**
 * Mocked {@link events.DidReceiveSettings} message.
 */
export const didReceiveSettings: events.DidReceiveSettings<Settings> = {
	action,
	context,
	device,
	event: "didReceiveSettings",
	payload: {
		coordinates: {
			column: 1,
			row: 3
		},
		isInMultiAction: true,
		settings: {
			name: "Elgato"
		}
	}
};

/**
 * Mocked {@link events.KeyDown} message.
 */
export const keyDown: events.KeyDown<Settings> = {
	action,
	context,
	device,
	event: "keyDown",
	payload: {
		coordinates: {
			column: 2,
			row: 2
		},
		isInMultiAction: false,
		settings: {
			name: "Elgato"
		},
		state: 1,
		userDesiredState: 0
	}
};

/**
 * Mocked {@link events.KeyUp} message.
 */
export const keyUp: events.KeyUp<Settings> = {
	...keyDown,
	event: "keyUp"
};

/**
 * Mocked {@link events.PropertyInspectorDidAppear} message.
 */
export const propertyInspectorDidAppear: events.PropertyInspectorDidAppear = {
	action,
	context,
	device,
	event: "propertyInspectorDidAppear"
};

/**
 * Mocked {@link events.PropertyInspectorDidDisappear} message.
 */
export const propertyInspectorDidDisappear: events.PropertyInspectorDidDisappear = {
	...propertyInspectorDidAppear,
	event: "propertyInspectorDidDisappear"
};

/**
 * Mocked {@link events.SendToPlugin} message.
 */
export const sendToPlugin: events.SendToPlugin<Settings> = {
	action,
	context,
	event: "sendToPlugin",
	payload: {
		name: "Elgato"
	}
};

/**
 * Mocked {@link events.SystemDidWakeUp} message.
 */
export const systemDidWakeUp: events.SystemDidWakeUp = {
	event: "systemDidWakeUp"
};

/**
 * Mocked {@link events.TitleParametersDidChange} message.
 */
export const titleParametersDidChange: events.TitleParametersDidChange<Settings> = {
	action,
	context,
	device,
	event: "titleParametersDidChange",
	payload: {
		controller: "Keypad",
		coordinates: {
			column: 3,
			row: 4
		},
		settings: {
			name: "Elgato"
		},
		title: "Hello world",
		titleParameters: {
			fontFamily: "Arial",
			fontSize: 13,
			fontStyle: "Bold Italic",
			fontUnderline: true,
			showTitle: false,
			titleAlignment: "middle",
			titleColor: "#ffffff"
		},
		state: 1
	}
};

/**
 * Mocked {@link events.TouchTap} message.
 */
export const touchTap: events.TouchTap<Settings> = {
	action,
	context,
	device,
	event: "touchTap",
	payload: {
		controller: "Encoder",
		coordinates: {
			column: 4,
			row: 0
		},
		hold: true,
		settings: {
			name: "Elgato"
		},
		tapPos: [10, 50]
	}
};

/**
 * Mocked {@link events.WillAppear} message.
 */
export const willAppear: events.WillAppear<Settings> = {
	action,
	context,
	device,
	event: "willAppear",
	payload: {
		controller: "Keypad",
		coordinates: {
			column: 8,
			row: 2
		},
		isInMultiAction: false,
		settings: {
			name: "Elgato"
		},
		state: 1
	}
};

/**
 * Mocked {@link events.WillDisappear} message.
 */
export const willDisappear: events.WillDisappear<Settings> = {
	...willAppear,
	event: "willDisappear"
};

/**
 * Mock settings.
 */
export type Settings = {
	/**
	 * Mock property.
	 */
	name: string;
};
