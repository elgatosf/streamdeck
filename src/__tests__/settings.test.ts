import { getMockedConnection } from "../../tests/__mocks__/connection";
import * as mockEvents from "../connectivity/__mocks__/events";
import { GetGlobalSettings, SetGlobalSettings } from "../connectivity/commands";
import { StreamDeckConnection } from "../connectivity/connection";
import { DidReceiveGlobalSettingsEvent } from "../events";
import { SettingsClient } from "../settings";

describe("SettingsClient", () => {
	/**
	 * Asserts {@link SettingsClient.getGlobalSettings} sends the command, and awaits the settings.
	 */
	it("Can getGlobalSettings", async () => {
		// Arrange.
		const { connection } = getMockedConnection();
		const settings = new SettingsClient(connection);

		// Act (Command).
		const globalSettings = settings.getGlobalSettings<mockEvents.Settings>();

		// Assert (Command).
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenLastCalledWith({
			event: "getGlobalSettings",
			context: connection.registrationParameters.pluginUUID
		} as GetGlobalSettings);

		expect(Promise.race([globalSettings, false])).resolves.toBe(false);

		// Act (Event).
		connection.__emit(mockEvents.didReceiveGlobalSettings);
		await globalSettings;

		// Assert (Event).
		expect(globalSettings).resolves.toEqual<mockEvents.Settings>({
			name: "Elgato"
		});
	});

	/**
	 * Asserts {@link SettingsClient.onDidReceiveGlobalSettings} invokes the listener when the connection emits the `didReceiveGlobalSettings` event.
	 */
	it("Receives onDidReceiveGlobalSettings", () => {
		// Arrange.
		const { connection } = getMockedConnection();
		const settings = new SettingsClient(connection);

		const listener = jest.fn();
		settings.onDidReceiveGlobalSettings(listener);

		// Act.
		const {
			payload: { settings: globalSettings }
		} = connection.__emit(mockEvents.didReceiveGlobalSettings);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveGlobalSettingsEvent<mockEvents.Settings>]>({
			settings: globalSettings,
			type: "didReceiveGlobalSettings"
		});
	});

	/**
	 * Asserts {@link SettingsClient.setGlobalSettings} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setGlobalSettings", async () => {
		// Arrange.
		const { connection } = getMockedConnection();
		const settings = new SettingsClient(connection);

		// Act.
		await settings.setGlobalSettings({
			name: "Elgato"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SetGlobalSettings]>({
			event: "setGlobalSettings",
			context: connection.registrationParameters.pluginUUID,
			payload: {
				name: "Elgato"
			}
		});
	});
});
