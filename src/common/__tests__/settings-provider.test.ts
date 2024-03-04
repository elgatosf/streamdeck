import { getConnection } from "../../../tests/__mocks__/connection";
import type { GetGlobalSettings, GetSettings } from "../../api";
import * as mockEvents from "../../api/__mocks__/events";
import { getGlobalSettings, getSettings } from "../settings-provider";

describe("getGlobalSettings", () => {
	/**
	 * Asserts {@link getGlobalSettings} sends the command, and awaits the settings.
	 */
	it("Requests and awaits global settings from the connection", async () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();

		// Act (Command).
		const settings = getGlobalSettings(connection, connection.registrationParameters.pluginUUID);

		// Assert (Command).
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenLastCalledWith({
			event: "getGlobalSettings",
			context: connection.registrationParameters.pluginUUID
		} as GetGlobalSettings);

		expect(Promise.race([settings, false])).resolves.toBe(false);

		// Act (Event).
		emitMessage(mockEvents.didReceiveGlobalSettings);
		await settings;

		// Assert (Event).
		expect(await settings).toEqual<mockEvents.Settings>({
			name: "Elgato"
		});
	});
});

describe("getSettings", () => {
	/**
	 * Asserts {@link getSettings} sends the command, and awaits the settings.
	 */
	it("Requests and awaits settings from the connection", async () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();

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

		emitMessage(other);
		emitMessage(mockEvents.didReceiveSettings);
		await settings;

		// Assert (Event).
		expect(await settings).toEqual<mockEvents.Settings>({
			name: "Elgato"
		});
	});
});
