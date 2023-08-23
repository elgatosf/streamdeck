import { DeviceType } from "../device-info";
import type { RegistrationParameters as __RegistrationParameters } from "../registration";

/**
 * Mock {@link __RegistrationParameters}.
 */
export const registrationParameters: __RegistrationParameters = {
	info: {
		application: {
			font: "Arial",
			language: "en",
			platform: "windows",
			platformVersion: "11",
			version: "6.4"
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
	},
	pluginUUID: "ABC123",
	port: "12345",
	registerEvent: "register"
};

/**
 * Mocked {@link __RegistrationParameters}.
 */
export const RegistrationParameters = jest.fn().mockImplementation(() => registrationParameters);
