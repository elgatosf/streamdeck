import type { SwitchToProfile } from "../../api";
import { Version } from "../common/version";
import { connection } from "../connection";
import { switchToProfile } from "../profiles";

jest.mock("../connection");
jest.mock("../logging");
jest.mock("../manifest");

describe("profiles", () => {
	describe("switchToProfile", () => {
		/**
		 * Asserts {@link switchToProfile} sends the command to the {@link connection}.
		 */
		it("sends", async () => {
			// Arrange, act.
			await switchToProfile("DEV1");
			await switchToProfile("DEV2", "Custom Profile (1)");
			await switchToProfile("DEV3", "Custom Profile (2)", 2);

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(3);
			expect(connection.send).toHaveBeenNthCalledWith<[SwitchToProfile]>(1, {
				event: "switchToProfile",
				context: connection.registrationParameters.pluginUUID,
				device: "DEV1",
				payload: {
					profile: undefined,
					page: undefined,
				},
			});
			expect(connection.send).toHaveBeenNthCalledWith<[SwitchToProfile]>(2, {
				event: "switchToProfile",
				context: connection.registrationParameters.pluginUUID,
				device: "DEV2",
				payload: {
					profile: "Custom Profile (1)",
					page: undefined,
				},
			});
			expect(connection.send).toHaveBeenNthCalledWith<[SwitchToProfile]>(3, {
				event: "switchToProfile",
				context: connection.registrationParameters.pluginUUID,
				device: "DEV3",
				payload: {
					profile: "Custom Profile (2)",
					page: 2,
				},
			});
		});

		/**
		 * Asserts {@link switchToProfile} throws an error if the Stream Deck version is earlier than 6.5.
		 */
		it("validates page parameter requires 6.5 (connection)", () => {
			// Arrange.
			jest.spyOn(connection, "version", "get").mockReturnValueOnce(new Version("6.4"));

			// Act, assert.
			expect(() => switchToProfile("DEV1", "Profile", 1)).toThrow(
				`[ERR_NOT_SUPPORTED]: Switching to a profile page requires Stream Deck version 6.5 or higher, but current version is 6.4; please update Stream Deck and the "Software.MinimumVersion" in the plugin's manifest to "6.5" or higher.`,
			);
		});
	});
});
