import { getMockedConnection } from "../../../tests/__mocks__/connection";
import { Action } from "../../actions/action";
import * as mockEvents from "../../connectivity/__mocks__/events";
import { GetGlobalSettings, SetGlobalSettings } from "../../connectivity/commands";
import { StreamDeckConnection } from "../../connectivity/connection";
import { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "../../events";
import { SettingsClient } from "../../settings/client";

describe("SettingsClient", () => {
	/**
	 * Asserts {@link SettingsClient.getGlobalSettings} sends the command, and awaits the settings.
	 */
	it("Can getGlobalSettings", async () => {
		// Arrange.
		const { connection } = getMockedConnection();
		const client = new SettingsClient(connection);

		// Act (Command).
		const settings = client.getGlobalSettings<mockEvents.Settings>();

		// Assert (Command).
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenLastCalledWith({
			event: "getGlobalSettings",
			context: connection.registrationParameters.pluginUUID
		} as GetGlobalSettings);

		expect(Promise.race([settings, false])).resolves.toBe(false);

		// Act (Event).
		connection.__emit(mockEvents.didReceiveGlobalSettings);
		await settings;

		// Assert (Event).
		expect(settings).resolves.toEqual<mockEvents.Settings>({
			name: "Elgato"
		});
	});

	/**
	 * Asserts {@link SettingsClient.onDidReceiveGlobalSettings} invokes the listener when the connection emits the `didReceiveGlobalSettings` event.
	 */
	it("Receives onDidReceiveGlobalSettings", () => {
		// Arrange.
		const { connection } = getMockedConnection();
		const client = new SettingsClient(connection);

		const listener = jest.fn();
		client.onDidReceiveGlobalSettings(listener);

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
	 * Asserts {@link SettingsClient.onDidReceiveSettings} invokes the listener when the connection emits the `didReceiveSettings` event.
	 */
	it("Receives onDidReceiveSettings", () => {
		// Arrange.
		const { connection } = getMockedConnection();
		const client = new SettingsClient(connection);

		const listener = jest.fn();
		client.onDidReceiveSettings(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.didReceiveSettings);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveSettingsEvent<mockEvents.Settings>]>({
			action: new Action(connection, { action, context }),
			deviceId: device,
			payload,
			type: "didReceiveSettings"
		});
	});

	/**
	 * Asserts {@link SettingsClient.setGlobalSettings} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setGlobalSettings", async () => {
		// Arrange.
		const { connection } = getMockedConnection();
		const client = new SettingsClient(connection);

		// Act.
		await client.setGlobalSettings({
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
