import { getMockedConnection } from "../../tests/__mocks__/connection";
import { SwitchToProfile } from "../connectivity/commands";
import { StreamDeckConnection } from "../connectivity/connection";
import { ProfileClient } from "../profiles";

describe("ProfileClient", () => {
	/**
	 * Asserts {@link ProfileClient.switchToProfile} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends switchToProfile", async () => {
		// Arrange.
		const { connection } = getMockedConnection();
		const profiles = new ProfileClient(connection);

		// Act.
		await profiles.switchToProfile("DEV1");
		await profiles.switchToProfile("DEV2", "Custom Profile");

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(2);
		expect(connection.send).toHaveBeenNthCalledWith<[SwitchToProfile]>(1, {
			event: "switchToProfile",
			context: connection.registrationParameters.pluginUUID,
			device: "DEV1",
			payload: {
				profile: undefined
			}
		});
		expect(connection.send).toHaveBeenNthCalledWith<[SwitchToProfile]>(2, {
			event: "switchToProfile",
			context: connection.registrationParameters.pluginUUID,
			device: "DEV2",
			payload: {
				profile: "Custom Profile"
			}
		});
	});
});
