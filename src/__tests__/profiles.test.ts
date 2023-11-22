import { getConnection } from "../../tests/__mocks__/connection";
import { SwitchToProfile } from "../connectivity/commands";
import { StreamDeckConnection } from "../connectivity/connection";
import { ProfileClient } from "../profiles";

describe("ProfileClient", () => {
	/**
	 * Asserts {@link ProfileClient.switchToProfile} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends switchToProfile", async () => {
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
});
