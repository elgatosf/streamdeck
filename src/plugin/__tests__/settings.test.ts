import { beforeAll, describe, expect, it, vi } from "vitest";

import { type Settings } from "../../api/__mocks__/events.js";
import {
	DeviceType,
	type DidReceiveGlobalSettings,
	type DidReceiveSettings,
	type GetGlobalSettings,
	type SetGlobalSettings,
} from "../../api/index.js";
import { actionStore } from "../actions/store.js";
import { connection } from "../connection.js";
import { Device } from "../devices/device.js";
import { deviceStore } from "../devices/store.js";
import type { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "../events/index.js";
import { getGlobalSettings, onDidReceiveGlobalSettings, onDidReceiveSettings, setGlobalSettings } from "../settings.js";

vi.mock("../connection.js");
vi.mock("../logging/index.js");
vi.mock("../manifest.js");
vi.mock("../actions/store.js");

describe("settings", () => {
	// Add a mock device.
	beforeAll(() => {
		deviceStore.set(
			new Device(
				"device123",
				{
					name: "Device One",
					size: {
						columns: 5,
						rows: 3,
					},
					type: DeviceType.StreamDeckXL,
				},
				true,
			),
		);
	});

	describe("sending", () => {
		/**
		 * Asserts {@link getGlobalSettings} sends the command to the {@link connection}, and await the settings.
		 */
		it("getGlobalSettings", async () => {
			// Arrange, act (Command).
			const settings = getGlobalSettings<Settings>();

			// Assert (Command).
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenLastCalledWith({
				event: "getGlobalSettings",
				context: connection.registrationParameters.pluginUUID,
				id: expect.any(String),
			} as GetGlobalSettings);

			await expect(Promise.race([settings, false])).resolves.toBe(false);

			// Act (Event).
			connection.emit("didReceiveGlobalSettings", {
				event: "didReceiveGlobalSettings",
				payload: {
					settings: {
						name: "Elgato",
					},
				},
			});
			await settings;

			// Assert (Event).
			await expect(settings).resolves.toEqual({
				name: "Elgato",
			} satisfies Settings);
		});

		/**
		 * Asserts {@link setGlobalSettings} sends the command to the {@link connection}.
		 */
		it("setGlobalSettings", async () => {
			// Arrange, act.
			await setGlobalSettings({
				name: "Elgato",
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetGlobalSettings]>({
				event: "setGlobalSettings",
				context: connection.registrationParameters.pluginUUID,
				payload: {
					name: "Elgato",
				},
			});
		});
	});

	describe("receiving", () => {
		/**
		 * Asserts {@link onDidReceiveGlobalSettings} is invoked when `didReceiveGlobalSettings` is emitted.
		 */
		it("onDidReceiveGlobalSettings", () => {
			// Arrange
			const listener = vi.fn();
			const ev = {
				event: "didReceiveGlobalSettings",
				payload: {
					settings: {
						name: "Elgato",
					},
				},
			} satisfies DidReceiveGlobalSettings<Settings>;

			// Act (emit).
			const disposable = onDidReceiveGlobalSettings(listener);
			connection.emit("didReceiveGlobalSettings", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DidReceiveGlobalSettingsEvent<Settings>]>({
				settings: {
					name: "Elgato",
				},
				type: "didReceiveGlobalSettings",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts {@link onDidReceiveSettings} is invoked when `didReceiveSettings` is emitted.
		 */
		it("onDidReceiveSettings", () => {
			// Arrange
			const listener = vi.fn();
			const ev = {
				action: "com.elgato.test.one",
				context: "key123",
				device: "device123",
				event: "didReceiveSettings",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 0,
						row: 0,
					},
					isInMultiAction: false,
					resources: {},
					settings: {
						name: "Elgato",
					},
				},
			} satisfies DidReceiveSettings<Settings>;

			// Act (emit).
			const disposable = onDidReceiveSettings(listener);
			connection.emit("didReceiveSettings", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DidReceiveSettingsEvent<Settings>]>({
				action: actionStore.getActionById(ev.context)!,
				payload: ev.payload,
				type: "didReceiveSettings",
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});
	});
});
