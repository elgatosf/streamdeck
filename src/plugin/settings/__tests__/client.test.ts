import { getConnection } from "../../../../tests/__mocks__/connection";
import type { GetGlobalSettings, SetGlobalSettings } from "../../../api";
import * as mockEvents from "../../../api/__mocks__/events";
import { Action } from "../../actions/action";
import { StreamDeckConnection } from "../../connectivity/connection";
import { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "../../events";
import { SettingsClient } from "../../settings/client";

describe("SettingsClient", () => {
	/**
	 * Asserts {@link SettingsClient.getGlobalSettings} sends the command, and awaits the settings.
	 */
	it("Can getGlobalSettings", async () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
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
		emitMessage(mockEvents.didReceiveGlobalSettings);
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
		const { connection, emitMessage } = getConnection();
		const client = new SettingsClient(connection);

		const listener = jest.fn();
		const emit = () => emitMessage(mockEvents.didReceiveGlobalSettings);

		// Act.
		const result = client.onDidReceiveGlobalSettings(listener);
		const {
			payload: { settings: globalSettings }
		} = emit();

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveGlobalSettingsEvent<mockEvents.Settings>]>({
			settings: globalSettings,
			type: "didReceiveGlobalSettings"
		});

		// Act (dispose).
		result.dispose();
		emit();

		// Assert (dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link SettingsClient.onDidReceiveSettings} invokes the listener when the connection emits the `didReceiveSettings` event.
	 */
	it("Receives onDidReceiveSettings", () => {
		// Arrange.
		const { connection, emitMessage } = getConnection();
		const client = new SettingsClient(connection);

		const listener = jest.fn();
		const emit = () => emitMessage(mockEvents.didReceiveSettings);

		// Act.
		const result = client.onDidReceiveSettings(listener);
		const { action, context, device, payload } = emit();

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith<[DidReceiveSettingsEvent<mockEvents.Settings>]>({
			action: new Action(connection, { action, context }),
			deviceId: device,
			payload,
			type: "didReceiveSettings"
		});

		// Act (dispose).
		result.dispose();
		emit();

		// Assert (dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link SettingsClient.setGlobalSettings} sends the command to the underlying {@link StreamDeckConnection}.
	 */
	it("Sends setGlobalSettings", async () => {
		// Arrange.
		const { connection } = getConnection();
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
