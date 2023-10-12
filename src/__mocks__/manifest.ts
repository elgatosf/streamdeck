import type { getManifest as __getManifest, Manifest } from "../manifest";

/**
 * Mock {@link Manifest}.
 */
export const manifest: Manifest = {
	Actions: [
		{
			Name: "Action One",
			UUID: "com.elgato.test.action",
			Icon: "imgs/actions/one",
			States: [
				{
					Image: "imgs/actions/state"
				}
			]
		}
	],
	Author: "Elgato",
	CodePath: "index.js",
	Description: "Example manifest",
	Icon: "imgs/plugin",
	Name: "Test Plugin",
	OS: [
		{
			MinimumVersion: "11",
			Platform: "windows"
		}
	],
	SDKVersion: 2,
	Software: {
		MinimumVersion: "6.4"
	},
	Version: "1.0.0"
};

/**
 * Mocked {@link __getManifest}.
 */
export const getManifest = jest.fn().mockReturnValue(manifest);
