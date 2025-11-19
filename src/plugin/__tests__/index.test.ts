import { describe, expect, it, vi } from "vitest";

import { BarSubType, DeviceType, Target } from "../../api/index.js";
import { EventEmitter } from "../../common/event-emitter.js";
import { I18nProvider } from "../../common/i18n.js";
import { LogLevel } from "../../common/logging/index.js";
import { SingletonAction } from "../actions/singleton-action.js";
import { connection } from "../connection.js";
import streamDeckAsDefaultExport, { streamDeck } from "../index.js";
import { logger } from "../logging/index.js";

vi.mock("../../common/i18n.js");
vi.mock("../logging/index.js");
vi.mock("../manifest.js");
vi.mock("../connection.js");

describe("index", () => {
	/**
	 * Asserts the named export, matches the default export.
	 */
	it("default is streamDeck const", async () => {
		// Arrange, act, assert.
		expect(streamDeck).toBe(streamDeckAsDefaultExport);
	});

	/**
	 * Asserts the namespaces are attached to the main export.
	 */
	it("exports namespaces", async () => {
		// Arrange.
		const { actionService } = await import("../actions/service.js");
		const { deviceService } = await import("../devices/service.js");
		const profiles = await import("../profiles.js");
		const { settings } = await import("../settings.js");
		const system = await import("../system.js");
		const { ui } = await import("../ui.js");

		// Act, assert.
		expect(streamDeck.actions).toBe(actionService);
		expect(streamDeck.devices).toBe(deviceService);
		expect(streamDeck.profiles).toBe(profiles);
		expect(streamDeck.settings).toBe(settings);
		expect(streamDeck.system).toBe(system);
		expect(streamDeck.ui).toBe(ui);
	});

	/**
	 * Asserts {@link streamDeck} can connect.
	 */
	it("connects", async () => {
		// Arrange.
		const spyOnConnect = vi.spyOn(connection, "connect");

		// Act, assert.
		await streamDeck.connect();
		expect(spyOnConnect).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link streamDeck} has a logger.
	 */
	it("has logger", () => {
		expect(streamDeck.logger).toEqual(logger);
	});

	/**
	 * Asserts supporting enums, classes, and functions are exported.
	 */
	it("exports enums, classes, and functions", async () => {
		// Arrange.
		const index = (await import("../index.js")) as typeof import("../index.js");

		// Act, assert.
		expect(index.BarSubType).toBe(BarSubType);
		expect(index.DeviceType).toBe(DeviceType);
		expect(index.EventEmitter).toBe(EventEmitter);
		expect(index.LogLevel).toBe(LogLevel);
		expect(index.SingletonAction).toBe(SingletonAction);
		expect(index.Target).toBe(Target);
	});

	/**
	 * Asserts the {@link I18nProvider} is lazily loaded.
	 */
	it("lazily loads i18n provider", async () => {
		// Arrange.
		expect(I18nProvider).toBeCalledTimes(0);

		// Act.
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		streamDeck.i18n; // Evaluate getter.

		// Assert.
		expect(I18nProvider).toHaveBeenCalledTimes(1);
	});
});
