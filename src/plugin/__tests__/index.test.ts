import { BarSubType, DeviceType, Target } from "../../api";
import { EventEmitter } from "../../common/event-emitter";
import { I18nProvider } from "../../common/i18n";
import { LogLevel } from "../../common/logging";
import { Action } from "../actions/action";
import { SingletonAction } from "../actions/singleton-action";
import { connection } from "../connection";
import streamDeckAsDefaultExport, { streamDeck } from "../index";
import { logger } from "../logging";
import { route } from "../ui/route";

jest.mock("../../common/i18n");
jest.mock("../logging");
jest.mock("../manifest");
jest.mock("../connection");

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
		const { actionService } = await require("../actions");
		const { devices } = await require("../devices");
		const { getManifest } = await require("../manifest");
		const profiles = await require("../profiles");
		const settings = await require("../settings");
		const system = await require("../system");
		const { ui } = await require("../ui");

		// Act, assert.
		expect(streamDeck.actions).toBe(actionService);
		expect(streamDeck.devices).toBe(devices);
		expect(streamDeck.manifest).toBe(getManifest());
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
		const spyOnConnect = jest.spyOn(connection, "connect");

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
		const index = (await require("../index")) as typeof import("../index");

		// Act, assert.
		expect(index.Action).toBe(Action);
		expect(index.ApplicationEvent).not.toBeUndefined();
		expect(index.BarSubType).toBe(BarSubType);
		expect(index.DeviceType).toBe(DeviceType);
		expect(index.EventEmitter).toBe(EventEmitter);
		expect(index.LogLevel).toBe(LogLevel);
		expect(index.SingletonAction).toBe(SingletonAction);
		expect(index.Target).toBe(Target);
		expect(index.route).toBe(route);
	});

	/**
	 * Asserts the {@link I18nProvider} is lazily loaded.
	 */
	it("lazily loads i18n provider", async () => {
		// Arrange.
		expect(I18nProvider).toBeCalledTimes(0);

		// Act, assert.
		streamDeck.i18n;
		expect(I18nProvider).toHaveBeenCalledTimes(1);
	});
});
