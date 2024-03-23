import type { DidReceiveGlobalSettings, DidReceiveSettings, GetGlobalSettings, SetGlobalSettings } from "../../api";
import { type Settings } from "../../api/__mocks__/events";
import { Action } from "../actions/action";
import { connection } from "../connection";
import type { DidReceiveGlobalSettingsEvent, DidReceiveSettingsEvent } from "../events";
import { getGlobalSettings, onDidReceiveGlobalSettings, onDidReceiveSettings, setGlobalSettings } from "../settings";

jest.mock("../connection");
jest.mock("../logging");
jest.mock("../manifest");

describe("settings", () => {
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
				context: connection.registrationParameters.pluginUUID
			} as GetGlobalSettings);

			expect(Promise.race([settings, false])).resolves.toBe(false);

			// Act (Event).
			connection.emit("didReceiveGlobalSettings", {
				event: "didReceiveGlobalSettings",
				payload: {
					settings: {
						name: "Elgato"
					}
				}
			});
			await settings;

			// Assert (Event).
			expect(settings).resolves.toEqual<Settings>({
				name: "Elgato"
			});
		});

		/**
		 * Asserts {@link setGlobalSettings} sends the command to the {@link connection}.
		 */
		it("setGlobalSettings", async () => {
			// Arrange, act.
			await setGlobalSettings({
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

	describe("receiving", () => {
		/**
		 * Asserts {@link onDidReceiveGlobalSettings} is invoked when `didReceiveGlobalSettings` is emitted.
		 */
		it("onDidReceiveGlobalSettings", () => {
			// Arrange
			const listener = jest.fn();
			const ev = {
				event: "didReceiveGlobalSettings",
				payload: {
					settings: {
						name: "Elgato"
					}
				}
			} satisfies DidReceiveGlobalSettings<Settings>;

			// Act (emit).
			const disposable = onDidReceiveGlobalSettings(listener);
			connection.emit("didReceiveGlobalSettings", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DidReceiveGlobalSettingsEvent<Settings>]>({
				settings: {
					name: "Elgato"
				},
				type: "didReceiveGlobalSettings"
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
			const listener = jest.fn();
			const ev = {
				action: "com.elgato.test.one",
				context: "context123",
				device: "device123",
				event: "didReceiveSettings",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 0,
						row: 0
					},
					isInMultiAction: false,
					settings: {
						name: "Elgato"
					}
				}
			} satisfies DidReceiveSettings<Settings>;

			// Act (emit).
			const disposable = onDidReceiveSettings(listener);
			connection.emit("didReceiveSettings", ev);

			// Assert (emit).
			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith<[DidReceiveSettingsEvent<Settings>]>({
				action: new Action(ev),
				deviceId: ev.device,
				payload: ev.payload,
				type: "didReceiveSettings"
			});

			// Act (dispose).
			disposable.dispose();
			connection.emit(ev.event, ev as any);

			// Assert(dispose).
			expect(listener).toHaveBeenCalledTimes(1);
		});
	});
});
