import { type ActionInfo, type RegistrationInfo } from "../";
import { DeviceType } from "../../device";

/**
 * Mocked {@link ActionInfo}.
 */
export const actionInfo: ActionInfo = {
	action: "com.elgato.test.actionOne",
	context: "abc123",
	device: "dev123",
	payload: {
		controller: "Keypad",
		coordinates: {
			column: 1,
			row: 2
		},
		settings: {
			message: "Hello world"
		}
	}
};

/**
 * Mocked {@link RegistrationInfo}.
 */
export const registrationInfo: RegistrationInfo = {
	application: {
		font: "Arial",
		language: "en",
		platform: "windows",
		platformVersion: "11",
		version: "99.8.6.54321"
	},
	colors: {
		buttonMouseOverBackgroundColor: "#ffffff",
		buttonPressedBackgroundColor: "#ffffff",
		buttonPressedBorderColor: "#ffffff",
		buttonPressedTextColor: "#ffffff",
		highlightColor: "#ffffff"
	},
	devicePixelRatio: 1,
	devices: [
		{
			id: "DEV1",
			name: "Device One",
			size: {
				columns: 5,
				rows: 3
			},
			type: DeviceType.StreamDeck
		}
	],
	plugin: {
		uuid: "com.elgato.test",
		version: "1.0"
	}
};
