import { DeviceType } from "../device-info";
import * as messages from "../events";

const action = "com.elgato.test.one";
const context = "context123";
const device = "device123";

/**
 * Mocked {@link messages.ApplicationDidLaunch} message.
 */
export const applicationDidLaunch: messages.ApplicationDidLaunch = {
	event: "applicationDidLaunch",
	payload: {
		application: "notepad.exe"
	}
};

/**
 * Mocked {@link messages.applicationDidTerminate} message.
 */
export const applicationDidTerminate: messages.ApplicationDidTerminate = {
	event: "applicationDidTerminate",
	payload: {
		application: "cmd.exe"
	}
};

/**
 * Mocked {@link messages.deviceDidConnect} message.
 */
export const deviceDidConnect: messages.DeviceDidConnect = {
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
 * Mocked {@link messages.deviceDidDisconnect} message.
 */
export const deviceDidDisconnect: messages.DeviceDidDisconnect = {
	event: "deviceDidDisconnect",
	device
};

/**
 * Mocked {@link messages.dialDown} message.
 */
export const dialDown: messages.DialDown<Settings> = {
	event: "dialDown",
	action,
	context,
	device,
	payload: {
		controller: "Encoder",
		coordinates: {
			column: 3,
			row: 1
		},
		settings: {
			name: "Elgato"
		}
	}
};

/**
 * Mocked {@link messages.dialRotate} message.
 */
export const dialRotate: messages.DialRotate<Settings> = {
	event: "dialRotate",
	action,
	context,
	device,
	payload: {
		controller: "Encoder",
		coordinates: {
			column: 3,
			row: 1
		},
		pressed: true,
		settings: {
			name: "Elgato"
		},
		ticks: -2
	}
};

/**
 * Mocked {@link messages.dialUp} message.
 */
export const dialUp: messages.DialUp<Settings> = {
	...dialDown,
	event: "dialUp"
};

/**
 * Mocked {@link messages.didReceiveGlobalSettings} message.
 */
export const didReceiveGlobalSettings: messages.DidReceiveGlobalSettings<Settings> = {
	event: "didReceiveGlobalSettings",
	payload: {
		settings: {
			name: "Elgato"
		}
	}
};

/**
 * Mocked {@link messages.didReceiveSettings} message.
 */
export const didReceiveSettings: messages.DidReceiveSettings<Settings> = {
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
 * Mocked {@link messages.keyDown} message.
 */
export const keyDown: messages.KeyDown<Settings> = {
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
 * Mocked {@link messages.keyUp} message.
 */
export const keyUp: messages.KeyUp<Settings> = {
	...keyDown,
	event: "keyUp"
};

/**
 * Mocked {@link messages.propertyInspectorDidAppear} message.
 */
export const propertyInspectorDidAppear: messages.PropertyInspectorDidAppear = {
	action,
	context,
	device,
	event: "propertyInspectorDidAppear"
};

/**
 * Mocked {@link messages.propertyInspectorDidDisappear} message.
 */
export const propertyInspectorDidDisappear: messages.PropertyInspectorDidDisappear = {
	...propertyInspectorDidAppear,
	event: "propertyInspectorDidDisappear"
};

/**
 * Mocked {@link messages.sendToPlugin} message.
 */
export const sendToPlugin: messages.SendToPlugin<Settings> = {
	action,
	context,
	event: "sendToPlugin",
	payload: {
		name: "Elgato"
	}
};

/**
 * Mocked {@link messages.systemDidWakeUp} message.
 */
export const systemDidWakeUp: messages.SystemDidWakeUp = {
	event: "systemDidWakeUp"
};

/**
 * Mocked {@link messages.titleParametersDidChange} message.
 */
export const titleParametersDidChange: messages.TitleParametersDidChange<Settings> = {
	action,
	context,
	device,
	event: "titleParametersDidChange",
	payload: {
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
 * Mocked {@link messages.touchTap} message.
 */
export const touchTap: messages.TouchTap<Settings> = {
	action,
	context,
	device,
	event: "touchTap",
	payload: {
		coordinates: {
			column: 4,
			row: 1
		},
		hold: true,
		settings: {
			name: "Elgato"
		},
		tapPos: [10, 50]
	}
};

/**
 * Mocked {@link messages.willAppear} message.
 */
export const willAppear: messages.WillAppear<Settings> = {
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
 * Mocked {@link messages.willDisappear} message.
 */
export const willDisappear: messages.WillDisappear<Settings> = {
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
