import { describe, expect, it, vi } from "vitest";

import { BarSubType, DeviceType, Target } from "../../api/index.js";
import { SingletonAction } from "../actions/singleton-action.js";
import { Version } from "../common/version.js";
import { connection } from "../connection.js";
import streamDeckAsDefaultExport, { streamDeck } from "../index.js";
import { logger } from "../logging/index.js";
import * as ManifestModule from "../manifest.js";

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
	 * Asserts {@link streamDeck} rejects connections when the default settings behavior is unsupported.
	 */
	it("rejects connection with default settings behavior before Stream Deck 7.1", async () => {
		// Arrange.
		const spyOnVersion = vi.spyOn(connection, "version", "get").mockReturnValue(new Version("7.0"));
		const spyOnMinimumVersion = vi
			.spyOn(ManifestModule, "getSoftwareMinimumVersion")
			.mockReturnValue(new Version("7.0"));
		const spyOnConnect = vi.spyOn(connection, "connect");

		try {
			// Act, assert.
			await expect(streamDeck.connect()).rejects.toThrow(
				"Default onDidReceiveSettings/onDidReceiveGlobalSettings behavior requires Stream Deck version 7.1 or higher",
			);
			expect(spyOnConnect).not.toHaveBeenCalled();
		} finally {
			spyOnVersion.mockRestore();
			spyOnMinimumVersion.mockRestore();
		}
	});

	/**
	 * Asserts legacy settings behavior bypasses the Stream Deck 7.1 compatibility guard.
	 */
	it("connects with legacy settings behavior before Stream Deck 7.1", async () => {
		// Arrange.
		const spyOnVersion = vi.spyOn(connection, "version", "get").mockReturnValue(new Version("7.0"));
		const spyOnMinimumVersion = vi
			.spyOn(ManifestModule, "getSoftwareMinimumVersion")
			.mockReturnValue(new Version("7.0"));
		const spyOnConnect = vi.spyOn(connection, "connect");
		streamDeck.settings.useLegacySettingsBehavior = true;

		try {
			// Act.
			await streamDeck.connect();

			// Assert.
			expect(spyOnConnect).toHaveBeenCalledTimes(1);
		} finally {
			spyOnVersion.mockRestore();
			spyOnMinimumVersion.mockRestore();
			streamDeck.settings.useLegacySettingsBehavior = false;
		}
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
		expect(index.SingletonAction).toBe(SingletonAction);
		expect(index.Target).toBe(Target);
	});
});
