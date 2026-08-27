import type { JsonObject } from "@elgato/utils";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, test, vi } from "vitest";

import type { Settings } from "../../../api/__mocks__/events.js";
import { DeviceType, type GetSettings, type SetSettings, type ShowAlert, type WillAppear } from "../../../api/index.js";
import { connection } from "../../connection.js";
import { Device } from "../../devices/device.js";
import { deviceStore } from "../../devices/store.js";
import { logger } from "../../logging/index.js";
import { ActionBase } from "../action-base.js";
import { settingsCache } from "../cache.js";
import { actionConfig } from "../config.js";
import { DialAction } from "../dial.js";
import { KeyAction } from "../key.js";

vi.mock("../../devices/store.js");
vi.mock("../../logging/index.js");
vi.mock("../../manifest.js");
vi.mock("../../connection.js");

describe("Action", () => {
	// Mock source.
	const source: WillAppear<JsonObject> = {
		action: "com.test.action.one",
		context: "action123",
		device: "device123",
		event: "willAppear",
		payload: {
			controller: "Keypad",
			coordinates: {
				column: 1,
				row: 2,
			},
			isInMultiAction: false,
			resources: {},
			settings: {},
		},
	};

	// Mock device.
	const device = new Device(
		"device123",
		{
			name: "Device 1",
			size: {
				columns: 5,
				rows: 3,
			},
			type: DeviceType.StreamDeck,
		},
		true,
	);

	beforeAll(() => vi.spyOn(deviceStore, "getDeviceById").mockReturnValue(device));
	afterEach(() => {
		settingsCache.delete(source.context);
		vi.clearAllMocks();
	});

	/**
	 * Asserts the constructor of {@link ActionBase} sets the properties from the source.
	 */
	it("constructor sets properties from source", () => {
		// Arrange, act.
		const action = new ActionBase(source);

		// Assert.
		expect(action).toBeInstanceOf(ActionBase);
		expect(action.controllerType).toBe("Keypad");
		expect(action.device).toBe(device);
		expect(action.id).toBe(source.context);
		expect(action.manifestId).toBe(source.action);
		expect(deviceStore.getDeviceById).toHaveBeenCalledTimes(1);
		expect(deviceStore.getDeviceById).toHaveBeenLastCalledWith(source.device);
	});

	describe("with useLegacySettingsBehavior set to false", () => {
		beforeEach(() => (actionConfig.useLegacySettingsBehavior = false));

		/**
		 * Asserts {@link ActionBase.getSettings} returns cached settings when the cache is valid.
		 */
		it("getSettings returns cached settings", async () => {
			// Arrange.
			const action = new ActionBase(source);
			const cachedSettings = { name: "Cached" };
			const spyOnTrace = vi.spyOn(logger, "trace");
			settingsCache.set(action.id, cachedSettings);

			// Act.
			const result = await action.getSettings();

			// Assert.
			expect(result).toEqual(cachedSettings);
			expect(connection.send).not.toHaveBeenCalled();
			expect(spyOnTrace).toHaveBeenCalledTimes(1);
			expect(spyOnTrace).toHaveBeenCalledWith(
				JSON.stringify({
					event: "getSettings",
					context: action.id,
					source: "cache",
					settings: cachedSettings,
				}),
			);
		});
	});

	describe("with useLegacySettingsBehavior set to true", () => {
		beforeAll(() => (actionConfig.useLegacySettingsBehavior = true));
		afterAll(() => (actionConfig.useLegacySettingsBehavior = false));

		/**
		 * Asserts {@link ActionBase.getSettings} ignores cached settings when legacy settings behavior is enabled.
		 */
		it("getSettings ignores cached settings", async () => {
			// Arrange.
			const action = new ActionBase(source);
			const spyOnTrace = vi.spyOn(logger, "trace");
			settingsCache.set(action.id, { name: "Cached" });

			// Act.
			const settings = action.getSettings();

			// Assert (Command sent instead of cache hit).
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenLastCalledWith<[GetSettings]>({
				event: "getSettings",
				context: action.id,
				id: expect.any(String),
			});
			expect(spyOnTrace).not.toHaveBeenCalled();

			// Act (Event).
			connection.emit("didReceiveSettings", {
				action: action.manifestId,
				context: action.id,
				event: "didReceiveSettings",
				device: "device123",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 1,
						row: 2,
					},
					isInMultiAction: false,
					resources: {},
					settings: {
						name: "Fresh",
					},
				},
			});

			// Assert.
			await expect(settings).resolves.toEqual({ name: "Fresh" });
			expect(settingsCache.get(action.id)).toEqual({ name: "Cached" });
		});

		/**
		 * Asserts {@link ActionBase.getSettings} requests settings from the connection and does not populate cache.
		 */
		it("getSettings fetches without populating cache", async () => {
			// Arrange.
			const action = new ActionBase(source);

			// Array, act (Command).
			const settings = action.getSettings();

			// Assert (Command).
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenLastCalledWith<[GetSettings]>({
				event: "getSettings",
				context: action.id,
				id: expect.any(String),
			});

			await expect(Promise.race([settings, false])).resolves.toBe(false);

			// Act (Event).
			connection.emit("didReceiveSettings", {
				action: "com.other.test.one",
				context: "__other__", // Other action.
				event: "didReceiveSettings",
				device: "device123",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 0,
						row: 0,
					},
					isInMultiAction: false,
					resources: {},
					settings: {
						name: "Other",
					},
				},
			});

			connection.emit("didReceiveSettings", {
				action: action.manifestId,
				context: action.id, // Correct action.
				event: "didReceiveSettings",
				device: "device123",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 1,
						row: 3,
					},
					isInMultiAction: false,
					resources: {},
					settings: {
						name: "Elgato",
					},
				},
			});

			// Assert (Event).
			await expect(settings).resolves.toEqual({
				name: "Elgato",
			} satisfies Settings);
			expect(settingsCache.get(action.id)).toBeUndefined();

			// Act (Repeat).
			const nextSettings = action.getSettings();

			// Assert (Repeat command).
			expect(connection.send).toHaveBeenCalledTimes(2);

			connection.emit("didReceiveSettings", {
				action: action.manifestId,
				context: action.id,
				event: "didReceiveSettings",
				device: "device123",
				payload: {
					controller: "Keypad",
					coordinates: {
						column: 1,
						row: 3,
					},
					isInMultiAction: false,
					resources: {},
					settings: {
						name: "Elgato Again",
					},
				},
			});

			await expect(nextSettings).resolves.toEqual({ name: "Elgato Again" });
			expect(settingsCache.get(action.id)).toBeUndefined();
		});
	});

	/**
	 * Asserts type-checking when the controller is "Keypad".
	 */
	test("keypad type assertion", () => {
		const action = new ActionBase({
			...source,
			payload: {
				...source.payload,
				controller: "Keypad",
			},
		});

		expect(action.isKey()).toBe(true);
		expect(action.isDial()).toBe(false);
		expect(action.isNeoInfobar()).toBe(false);
	});

	/**
	 * Asserts type-checking when the controller is "Encoder".
	 */
	test("encoder type assertion", () => {
		const action = new DialAction({
			...source,
			payload: {
				...source.payload,
				controller: "Encoder",
			},
		} as WillAppear<JsonObject>);

		expect(action.isDial()).toBe(true);
		expect(action.isKey()).toBe(false);
	});

	describe("sending", () => {
		let action!: KeyAction<Settings>;
		beforeAll(() => (action = new KeyAction(source as WillAppear<Settings>)));

		/**
		 * Asserts {@link ActionBase.setSettings} invalidates the settings cache.
		 */
		it("setSettings invalidates cache", async () => {
			// Arrange.
			const action = new ActionBase(source);
			settingsCache.set(action.id, { name: "Cached" });

			// Act.
			await action.setSettings({ name: "Updated" });

			// Assert.
			expect(settingsCache.get(action.id)).toBeUndefined();

			// Cleanup.
			settingsCache.delete(action.id);
		});

		/**
		 * Asserts {@link ActionBase.setSettings} forwards the command to the {@link connection}.
		 */
		it("setSettings", async () => {
			// Arrange, act.
			await action.setSettings({
				name: "Elgato",
			});

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[SetSettings]>({
				context: action.id,
				event: "setSettings",
				payload: {
					name: "Elgato",
				},
			});
		});

		/**
		 * Asserts {@link ActionBase.setSettings} with a synchronous update function uses cached settings and sends updated settings.
		 */
		it("setSettings with sync update function", async () => {
			// Arrange.
			const action = new ActionBase(source);
			settingsCache.set(action.id, { name: "Original" });

			// Act.
			await action.setSettings((current) => ({
				...current,
				name: `${current.name} Updated`,
			}));

			// Assert (only setSettings command sent, getSettings used cache).
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenLastCalledWith<[SetSettings]>({
				context: action.id,
				event: "setSettings",
				payload: { name: "Original Updated" },
			});
		});

		/**
		 * Asserts {@link ActionBase.setSettings} with an async update function uses cached settings and sends updated settings.
		 */
		it("setSettings with async update function", async () => {
			// Arrange.
			const action = new ActionBase(source);
			settingsCache.set(action.id, { name: "Current" });

			// Act.
			await action.setSettings(async (current) => {
				await Promise.resolve(); // Simulate async work.
				return {
					...current,
					name: `${current.name} Async`,
				};
			});

			// Assert (only setSettings command sent, getSettings used cache).
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenLastCalledWith<[SetSettings]>({
				context: action.id,
				event: "setSettings",
				payload: { name: "Current Async" },
			});
		});

		/**
		 * Asserts {@link ActionBase.setSettings} with an update function invalidates the settings cache.
		 */
		it("setSettings with update function invalidates cache", async () => {
			// Arrange.
			const action = new ActionBase(source);
			settingsCache.set(action.id, { name: "Cached" });

			// Act.
			await action.setSettings((current) => ({
				...current,
				name: "Updated via function",
			}));

			// Assert.
			expect(settingsCache.get(action.id)).toBeUndefined();
		});

		/**
		 * Asserts {@link ActionBase.showAlert} forwards the command to the {@link connection}.
		 */
		it("showAlert", async () => {
			// Arrange, act.
			await action.showAlert();

			// Assert.
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenCalledWith<[ShowAlert]>({
				context: action.id,
				event: "showAlert",
			});
		});
	});
});
