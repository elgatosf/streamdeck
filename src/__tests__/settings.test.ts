import { getMockedActionContainer } from "../../tests/__mocks__/action-container";
import { Action } from "../actions/action";
import * as mockEvents from "../connectivity/__mocks__/events";
import { GetGlobalSettings, GetSettings, SetGlobalSettings, SetSettings } from "../connectivity/commands";
import { StreamDeckConnection } from "../connectivity/connection";
import { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "../events";
import { SettingsClient } from "../settings";

describe("SettingsClient", () => {
	/**
	 * Asserts {@link SettingsClient.getGlobalSettings} sends the command, and awaits the settings.
	 */
	it("Can getGlobalSettings", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new SettingsClient(connection, container);

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
	 * Asserts {@link SettingsClient.getSettings} sends the command, and awaits the settings.
	 */
	it("Can getSettings", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new SettingsClient(connection, container);

		// Act (Command).
		const settings = client.getSettings<mockEvents.Settings>(mockEvents.didReceiveSettings.context);

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

	/**
	 * Asserts {@link SettingsClient.onDidReceiveGlobalSettings} invokes the listener when the connection emits the `didReceiveGlobalSettings` event.
	 */
	it("Receives onDidReceiveGlobalSettings", () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new SettingsClient(connection, container);

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
		const { connection, container } = getMockedActionContainer();
		const client = new SettingsClient(connection, container);

		const listener = jest.fn();
		client.onDidReceiveSettings(listener);

		// Act.
		const { action, context, device, payload } = connection.__emit(mockEvents.didReceiveSettings);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveSettingsEvent<mockEvents.Settings>]>({
			action: new Action(container.controller, action, context),
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
		const { connection, container } = getMockedActionContainer();
		const client = new SettingsClient(connection, container);

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

	/**
	 * Asserts {@link SettingsClient.setSettings} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setSettings", async () => {
		// Arrange.
		const { connection, container } = getMockedActionContainer();
		const client = new SettingsClient(connection, container);

		// Act.
		await client.setSettings("ABC123", {
			name: "Elgato"
		});

		// Assert.
		expect(connection.send).toHaveBeenCalledTimes(1);
		expect(connection.send).toHaveBeenCalledWith<[SetSettings]>({
			event: "setSettings",
			context: "ABC123",
			payload: {
				name: "Elgato"
			}
		});
	});
});
