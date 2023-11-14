import { getMockedConnection } from "../../../tests/__mocks__/connection";
import * as mockEvents from "../../connectivity/__mocks__/events";
import { GetSettings } from "../../connectivity/commands";
import { SettingsClient } from "../../settings/client";
import { getSettings } from "../provider";

describe("getSettings", () => {
	/**
	 * Asserts {@link SettingsClient.getSettings} sends the command, and awaits the settings.
	 */
	it("Requests and awaits settings from the connection", async () => {
		// Arrange.
		const { connection } = getMockedConnection();

		// Act (Command).
		const settings = getSettings(connection, mockEvents.didReceiveSettings.context);

		// Assert (Command).
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenLastCalledWith({
			event: "getSettings",
			context: mockEvents.didReceiveSettings.context
		} as GetSettings);

		expect(Promise.race([settings, false])).resolves.toBe(false);

		// Act (Event).
		const other = JSON.parse(JSON.stringify(mockEvents.didReceiveSettings)); // Clone by value, not reference.
		other.context = "__XYZ123";
		other.payload.settings.name = "Other settings";

		connection.__emit(other);
		connection.__emit(mockEvents.didReceiveSettings);
		await settings;

		// Assert (Event).
		expect(await settings).toEqual<mockEvents.Settings>({
			name: "Elgato"
		});
	});
});
