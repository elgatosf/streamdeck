import { vi } from "vitest";

import type { Manifest } from "../../api";
import { Version } from "../common/version";
import type {
	getManifest as __getManifest,
	getSoftwareMinimumVersion as __getSoftwareMinimumVersion,
} from "../manifest";

/**
 * Mock {@link Manifest}.
 */
export const manifest: Manifest = {
	Actions: [
		{
			Name: "Action One",
			UUID: "com.elgato.test.key",
			Icon: "imgs/actions/one",
			States: [
				{
					Image: "imgs/actions/state",
				},
			],
		},
		{
			Name: "Action Two",
			UUID: "com.elgato.test.dial",
			Icon: "imgs/actions/one",
			States: [
				{
					Image: "imgs/actions/state",
				},
			],
		},
	],
	Author: "Elgato",
	CodePath: "index.js",
	Description: "Example manifest",
	Icon: "imgs/plugin",
	Name: "Test Plugin",
	OS: [
		{
			MinimumVersion: "11",
			Platform: "windows",
		},
	],
	SDKVersion: 2,
	Software: {
		MinimumVersion: "7.1",
	},
	UUID: "com.elgato.test",
	Version: "1.0.0",
};

/**
 * Mocked `getSDKVersion`.
 */
export const getSDKVersion = vi.fn().mockReturnValue(3);

/**
 * Mocked {@link __getSoftwareMinimumVersion}.
 */
export const getSoftwareMinimumVersion = vi.fn().mockReturnValue(new Version(manifest.Software.MinimumVersion));

/**
 * Mocked {@link __getManifest}.
 */
export const getManifest = vi.fn().mockReturnValue(manifest);
