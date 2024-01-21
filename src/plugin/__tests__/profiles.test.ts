import { getConnection } from "../../../tests/__mocks__/connection";
import { Version } from "../common/version";

import type { SwitchToProfile } from "../../api";
import { StreamDeckConnection } from "../connectivity/connection";
import { ProfileClient } from "../profiles";
import * as ValidationModule from "../validation";

jest.mock("../manifest");
jest.mock("../validation", () => {
	return {
		__esModule: true,
		...jest.requireActual("../validation")
	};
});

describe("ProfileClient", () => {
	describe("switchToProfile", () => {
		/**
		 * Asserts {@link ProfileClient.switchToProfile} sends the command to the underlying {@link StreamDeckConnection}.
		 */
		it("Sends", async () => {
			// Arrange.
			const { connection } = getConnection();
			const profiles = new ProfileClient(connection);

			// Act.
			await profiles.switchToProfile("DEV1");
			await profiles.switchToProfile("DEV2", "Custom Profile (1)");
			await profiles.switchToProfile("DEV3", "Custom Profile (2)", 2);

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(3);
			expect(connection.send).toHaveBeenNthCalledWith<[SwitchToProfile]>(1, {
				event: "switchToProfile",
				context: connection.registrationParameters.pluginUUID,
				device: "DEV1",
				payload: {
					profile: undefined,
					page: undefined
				}
			});
			expect(connection.send).toHaveBeenNthCalledWith<[SwitchToProfile]>(2, {
				event: "switchToProfile",
				context: connection.registrationParameters.pluginUUID,
				device: "DEV2",
				payload: {
					profile: "Custom Profile (1)",
					page: undefined
				}
			});
			expect(connection.send).toHaveBeenNthCalledWith<[SwitchToProfile]>(3, {
				event: "switchToProfile",
				context: connection.registrationParameters.pluginUUID,
				device: "DEV3",
				payload: {
					profile: "Custom Profile (2)",
					page: 2
				}
			});
		});

		/**
		 * Asserts {@link ProfileClient.switchToProfile} throws an error if the Stream Deck version is earlier than 6.5.
		 */
		it("Validates page parameter requires 6.5 (connection)", () => {
			// Arrange.
			const { connection } = getConnection(6.4);
			const profiles = new ProfileClient(connection);
			const spy = jest.spyOn(ValidationModule, "requiresVersion");

			// Act, assert.
			expect(() => profiles.switchToProfile("DEV1", "Profile", 1)).toThrow(
				`[ERR_NOT_SUPPORTED]: Switching to a profile page requires Stream Deck version 6.5 or higher, but current version is 6.4; please update Stream Deck and the "Software.MinimumVersion" in the plugin's manifest to "6.5" or higher.`
			);
			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith<[number, Version, string]>(6.5, connection.version, "Switching to a profile page");
		});
	});
});
