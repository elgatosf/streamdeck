import type { JsonObject } from "@elgato/utils";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, test, vi } from "vitest";

import {
	didReceivePropertyInspectorMessage,
	didReceiveSettings,
	propertyInspectorDidAppear,
	propertyInspectorDidDisappear,
	type Settings,
	titleParametersDidChange,
} from "../../../../api/__mocks__/events.js";
import {
	DeviceType,
	type DidReceiveResources,
	type DidReceiveSettings,
	type GetSettings,
	type SetSettings,
	type WillAppear,
	type WillDisappear,
} from "../../../../api/index.js";
import { connection } from "../../../connection.js";
import { Device } from "../../../devices/device.js";
import { deviceStore } from "../../../devices/store.js";
import { logger } from "../../../logging/index.js";
import { actionConfig } from "../../config.js";
import { actionStore } from "../../store.js";
import {
	ActionBase,
	type DidReceiveResourcesArgs,
	type DidReceiveSettingsArgs,
	type SendToPluginArgs,
	type TitleParametersDidChangeArgs,
} from "../action-base.js";
import { DialAction } from "../dial.js";
import { KeyAction } from "../key.js";
import { NeoInfobarAction } from "../neo-infobar.js";

vi.mock("../../../devices/store.js");
vi.mock("../../../logging/index.js");
vi.mock("../../../manifest.js");
vi.mock("../../../connection.js");

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
		// Dispose of the listeners registered by actions created during the test.
		connection.emit(`willDisappear:${source.action}:${source.context}`, { ...source, event: "willDisappear" });
		vi.clearAllMocks();
	});

	/**
	 * Emits the `didReceiveSettings` event for the action, contextualized and then un-contextualized, as per the
	 * {@link connection}.
	 * @param settings Settings received.
	 * @param context Action instance the settings are for.
	 */
	function emitDidReceiveSettings(settings: JsonObject, context = source.context): void {
		const ev = {
			action: source.action,
			context,
			device: source.device,
			event: "didReceiveSettings",
			payload: {
				controller: "Keypad",
				coordinates: {
					column: 1,
					row: 2,
				},
				isInMultiAction: false,
				resources: {},
				settings,
			},
		} satisfies DidReceiveSettings<JsonObject>;

		connection.emit(`didReceiveSettings:${ev.action}:${ev.context}`, ev);
		connection.emit("didReceiveSettings", ev);
	}

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

	/**
	 * Asserts the action is removed from the store when it disappears, and subsequent `willDisappear` events for the
	 * same action are ignored.
	 */
	it("removes the action from the store once on willDisappear", () => {
		// Arrange.
		const action = new KeyAction(source);
		actionStore.set(action);

		const spyOnDelete = vi.spyOn(actionStore, "delete");
		const willDisappear = {
			...source,
			event: "willDisappear",
		} satisfies WillDisappear<JsonObject>;

		// Act (first).
		connection.emit(`willDisappear:${source.action}:${source.context}`, willDisappear);

		// Assert (first).
		expect(spyOnDelete).toHaveBeenCalledTimes(1);
		expect(spyOnDelete).toHaveBeenCalledWith(source.context);
		expect(actionStore.getActionById(source.context)).toBeUndefined();

		// Act (subsequent); the action is re-added so that an unexpected removal would be observable.
		actionStore.set(action);
		connection.emit(`willDisappear:${source.action}:${source.context}`, willDisappear);

		// Assert (subsequent).
		expect(spyOnDelete).toHaveBeenCalledTimes(1);
		expect(actionStore.getActionById(source.context)).toBe(action);

		// Cleanup.
		actionStore.delete(source.context);
	});

	describe("with useLegacySettingsBehavior set to false", () => {
		beforeEach(() => (actionConfig.useLegacySettingsBehavior = false));

		/**
		 * Asserts {@link ActionBase.getSettings} returns the settings from the source, without requesting them.
		 */
		it("getSettings returns settings cached from the source", async () => {
			// Arrange.
			const action = new ActionBase({
				...source,
				payload: {
					...source.payload,
					settings: { name: "Source" },
				},
			});
			const spyOnTrace = vi.spyOn(logger, "trace");

			// Act.
			const result = await action.getSettings();

			// Assert.
			expect(result).toEqual({ name: "Source" });
			expect(connection.send).not.toHaveBeenCalled();
			expect(spyOnTrace).toHaveBeenCalledTimes(1);
			expect(spyOnTrace).toHaveBeenCalledWith(
				JSON.stringify({
					event: "getSettings",
					context: action.id,
					source: "cache",
					settings: { name: "Source" },
				}),
			);
		});

		/**
		 * Asserts {@link ActionBase.getSettings} returns the settings last received for the action.
		 */
		it("getSettings returns settings cached from didReceiveSettings", async () => {
			// Arrange.
			const action = new ActionBase(source);

			// Act.
			emitDidReceiveSettings({ name: "Other" }, "__other__");
			emitDidReceiveSettings({ name: "Received" });
			const result = await action.getSettings();

			// Assert.
			expect(result).toEqual({ name: "Received" });
			expect(connection.send).not.toHaveBeenCalled();
		});

		/**
		 * Asserts {@link ActionBase.setSettings} invalidates the cache, and the settings are then requested and cached.
		 */
		it("getSettings requests settings after setSettings", async () => {
			// Arrange.
			const action = new ActionBase(source);
			await action.setSettings({ name: "Updated" });
			vi.mocked(connection.send).mockClear();

			// Act (Command).
			const settings = action.getSettings();

			// Assert (Command).
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenLastCalledWith<[GetSettings]>({
				event: "getSettings",
				context: action.id,
				id: expect.any(String),
			});

			// Act (Event).
			emitDidReceiveSettings({ name: "Updated" });

			// Assert (Event).
			await expect(settings).resolves.toEqual({ name: "Updated" });

			// Act, assert (cached).
			await expect(action.getSettings()).resolves.toEqual({ name: "Updated" });
			expect(connection.send).toHaveBeenCalledTimes(1);
		});

		/**
		 * Asserts the action stops caching settings, and is removed from the store, when it disappears.
		 */
		it("stops caching settings on willDisappear", async () => {
			// Arrange.
			const action = new ActionBase({
				...source,
				payload: {
					...source.payload,
					settings: { name: "Source" },
				},
			});
			const spyOnDelete = vi.spyOn(actionStore, "delete");
			const willDisappear = {
				...source,
				event: "willDisappear",
			} satisfies WillDisappear<JsonObject>;

			// Act.
			connection.emit(`willDisappear:${source.action}:${source.context}`, willDisappear);
			emitDidReceiveSettings({ name: "Received" });

			// Assert.
			expect(spyOnDelete).toHaveBeenCalledTimes(1);
			expect(spyOnDelete).toHaveBeenCalledWith(source.context);
			await expect(action.getSettings()).resolves.toEqual({ name: "Source" });
		});
	});

	describe("with useLegacySettingsBehavior set to true", () => {
		beforeAll(() => (actionConfig.useLegacySettingsBehavior = true));
		afterAll(() => (actionConfig.useLegacySettingsBehavior = false));

		/**
		 * Asserts {@link ActionBase.getSettings} always requests the settings, ignoring the cache.
		 */
		it("getSettings ignores cached settings", async () => {
			// Arrange.
			const action = new ActionBase({
				...source,
				payload: {
					...source.payload,
					settings: { name: "Source" },
				},
			});
			const spyOnTrace = vi.spyOn(logger, "trace");

			// Act (Command).
			const settings = action.getSettings();

			// Assert (Command).
			expect(connection.send).toHaveBeenCalledTimes(1);
			expect(connection.send).toHaveBeenLastCalledWith<[GetSettings]>({
				event: "getSettings",
				context: action.id,
				id: expect.any(String),
			});
			expect(spyOnTrace).not.toHaveBeenCalled();

			await expect(Promise.race([settings, false])).resolves.toBe(false);

			// Act (Event).
			emitDidReceiveSettings({ name: "Other" }, "__other__");
			emitDidReceiveSettings({ name: "Elgato" });

			// Assert (Event).
			await expect(settings).resolves.toEqual({
				name: "Elgato",
			} satisfies Settings);

			// Act (Repeat).
			const nextSettings = action.getSettings();
			emitDidReceiveSettings({ name: "Elgato Again" });

			// Assert (Repeat).
			expect(connection.send).toHaveBeenCalledTimes(2);
			await expect(nextSettings).resolves.toEqual({ name: "Elgato Again" });
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
		expect(action.isNeoInfobar()).toBe(false);
	});

	/**
	 * Asserts type-checking when the controller is "Neo".
	 */
	test("neo type assertion", () => {
		const action = new NeoInfobarAction({
			...source,
			payload: {
				...source.payload,
				controller: "Neo",
			},
		} as WillAppear<JsonObject>);

		expect(action.isDial()).toBe(false);
		expect(action.isKey()).toBe(false);
		expect(action.isNeoInfobar()).toBe(true);
	});

	describe("sending", () => {
		let action!: KeyAction<Settings>;
		beforeAll(() => (action = new KeyAction(source as WillAppear<Settings>)));

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
	});

	describe("events", () => {
		// Identity of the action the events are for.
		const identity = { action: source.action, context: source.context };

		/**
		 * Asserts {@link ActionBase.onDidReceiveSettings} is called with only the settings, and only when the settings
		 * were not requested.
		 */
		it("calls onDidReceiveSettings with the settings", () => {
			// Arrange.
			actionConfig.useLegacySettingsBehavior = false;
			const onDidReceiveSettings = vi.fn();

			class TestAction extends ActionBase<JsonObject> {
				/** @inheritdoc */
				public override onDidReceiveSettings(args: DidReceiveSettingsArgs<JsonObject>): void {
					onDidReceiveSettings(args);
				}
			}

			new TestAction(source);
			const ev = { ...didReceiveSettings, ...identity };

			// Act.
			connection.emit(`didReceiveSettings:${source.action}:${source.context}`, { ...ev, id: "request" });
			connection.emit(`didReceiveSettings:${source.action}:${source.context}`, ev);

			// Assert.
			expect(onDidReceiveSettings).toHaveBeenCalledTimes(1);
			expect(onDidReceiveSettings).toHaveBeenCalledWith<[DidReceiveSettingsArgs<JsonObject>]>({
				settings: ev.payload.settings,
			});
		});

		/**
		 * Asserts {@link ActionBase.onDidReceiveSettings} is also called for requested settings when using the legacy
		 * settings behavior.
		 */
		it("calls onDidReceiveSettings for requested settings with legacy behavior", () => {
			// Arrange.
			actionConfig.useLegacySettingsBehavior = true;
			const onDidReceiveSettings = vi.fn();

			class TestAction extends ActionBase<JsonObject> {
				/** @inheritdoc */
				public override onDidReceiveSettings(args: DidReceiveSettingsArgs<JsonObject>): void {
					onDidReceiveSettings(args);
				}
			}

			new TestAction(source);

			// Act.
			connection.emit(`didReceiveSettings:${source.action}:${source.context}`, {
				...didReceiveSettings,
				...identity,
				id: "request",
			});

			// Assert.
			expect(onDidReceiveSettings).toHaveBeenCalledTimes(1);

			// Cleanup.
			actionConfig.useLegacySettingsBehavior = false;
		});

		/**
		 * Asserts {@link ActionBase.onDidReceiveResources} is called with only the resources, and only when the
		 * resources were not requested.
		 */
		it("calls onDidReceiveResources with the resources", () => {
			// Arrange.
			const onDidReceiveResources = vi.fn();

			class TestAction extends ActionBase<JsonObject> {
				/** @inheritdoc */
				public override onDidReceiveResources(args: DidReceiveResourcesArgs): void {
					onDidReceiveResources(args);
				}
			}

			new TestAction(source);
			const ev = {
				...didReceiveSettings,
				...identity,
				event: "didReceiveResources",
				payload: {
					...didReceiveSettings.payload,
					resources: { file: "c:\\file.txt" },
				},
			} satisfies DidReceiveResources<JsonObject>;

			// Act.
			connection.emit(`didReceiveResources:${source.action}:${source.context}`, { ...ev, id: "request" });
			connection.emit(`didReceiveResources:${source.action}:${source.context}`, ev);

			// Assert.
			expect(onDidReceiveResources).toHaveBeenCalledTimes(1);
			expect(onDidReceiveResources).toHaveBeenCalledWith<[DidReceiveResourcesArgs]>({
				resources: { file: "c:\\file.txt" },
			});
		});

		/**
		 * Asserts the property inspector methods are called, without arguments.
		 */
		it("calls onPropertyInspectorDidAppear and onPropertyInspectorDidDisappear without arguments", () => {
			// Arrange.
			const onPropertyInspectorDidAppear = vi.fn();
			const onPropertyInspectorDidDisappear = vi.fn();

			class TestAction extends ActionBase<JsonObject> {
				/** @inheritdoc */
				public override onPropertyInspectorDidAppear(...args: unknown[]): void {
					onPropertyInspectorDidAppear(...args);
				}

				/** @inheritdoc */
				public override onPropertyInspectorDidDisappear(...args: unknown[]): void {
					onPropertyInspectorDidDisappear(...args);
				}
			}

			new TestAction(source);

			// Act.
			connection.emit(`propertyInspectorDidAppear:${source.action}:${source.context}`, {
				...propertyInspectorDidAppear,
				...identity,
			});
			connection.emit(`propertyInspectorDidDisappear:${source.action}:${source.context}`, {
				...propertyInspectorDidDisappear,
				...identity,
			});

			// Assert.
			expect(onPropertyInspectorDidAppear).toHaveBeenCalledTimes(1);
			expect(onPropertyInspectorDidAppear).toHaveBeenCalledWith();
			expect(onPropertyInspectorDidDisappear).toHaveBeenCalledTimes(1);
			expect(onPropertyInspectorDidDisappear).toHaveBeenCalledWith();
		});

		/**
		 * Asserts {@link ActionBase.onSendToPlugin} is called with only the payload.
		 */
		it("calls onSendToPlugin with the payload", () => {
			// Arrange.
			const onSendToPlugin = vi.fn();

			class TestAction extends ActionBase<JsonObject> {
				/** @inheritdoc */
				public override onSendToPlugin(args: SendToPluginArgs): void {
					onSendToPlugin(args);
				}
			}

			new TestAction(source);
			const ev = { ...didReceivePropertyInspectorMessage, ...identity };

			// Act.
			connection.emit(`sendToPlugin:${source.action}:${source.context}`, ev);

			// Assert.
			expect(onSendToPlugin).toHaveBeenCalledTimes(1);
			expect(onSendToPlugin).toHaveBeenCalledWith<[SendToPluginArgs]>({ payload: ev.payload });
		});

		/**
		 * Asserts {@link ActionBase.onTitleParametersDidChange} is called with only the title and its parameters.
		 */
		it("calls onTitleParametersDidChange with the title and parameters", () => {
			// Arrange.
			const onTitleParametersDidChange = vi.fn();

			class TestAction extends ActionBase<JsonObject> {
				/** @inheritdoc */
				public override onTitleParametersDidChange(args: TitleParametersDidChangeArgs): void {
					onTitleParametersDidChange(args);
				}
			}

			new TestAction(source);
			const ev = { ...titleParametersDidChange, ...identity };

			// Act.
			connection.emit(`titleParametersDidChange:${source.action}:${source.context}`, ev);

			// Assert.
			expect(onTitleParametersDidChange).toHaveBeenCalledTimes(1);
			expect(onTitleParametersDidChange).toHaveBeenCalledWith<[TitleParametersDidChangeArgs]>({
				title: ev.payload.title,
				titleParameters: ev.payload.titleParameters,
			});
		});

		/**
		 * Asserts {@link ActionBase.onWillDisappear} is called once, without arguments, and other methods are no
		 * longer called afterwards.
		 */
		it("calls onWillDisappear once without arguments, and then stops calling methods", () => {
			// Arrange.
			const onWillDisappear = vi.fn();
			const onSendToPlugin = vi.fn();

			class TestAction extends ActionBase<JsonObject> {
				/** @inheritdoc */
				public override onSendToPlugin(): void {
					onSendToPlugin();
				}

				/** @inheritdoc */
				public override onWillDisappear(...args: unknown[]): void {
					onWillDisappear(...args);
				}
			}

			new TestAction(source);
			const willDisappear = { ...source, event: "willDisappear" } satisfies WillDisappear<JsonObject>;

			// Act.
			connection.emit(`willDisappear:${source.action}:${source.context}`, willDisappear);
			connection.emit(`willDisappear:${source.action}:${source.context}`, willDisappear);
			connection.emit(`sendToPlugin:${source.action}:${source.context}`, {
				...didReceivePropertyInspectorMessage,
				...identity,
			});

			// Assert.
			expect(onWillDisappear).toHaveBeenCalledTimes(1);
			expect(onWillDisappear).toHaveBeenCalledWith();
			expect(onSendToPlugin).not.toHaveBeenCalled();
		});

		/**
		 * Asserts event listeners are only added when the associated method is defined.
		 */
		it("does not listen for events without a method", () => {
			// Arrange.
			const spyOnOn = vi.spyOn(connection, "on");

			// Act.
			new ActionBase(source);

			// Assert.
			expect(spyOnOn).not.toHaveBeenCalled();
		});
	});
});
