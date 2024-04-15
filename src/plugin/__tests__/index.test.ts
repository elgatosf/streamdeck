import { BarSubType, DeviceType, Target } from "../../api";
import { EventEmitter } from "../../common/event-emitter";
import { LogLevel } from "../../common/logging";
import { Action } from "../actions/action";
import { SingletonAction } from "../actions/singleton-action";
import { connection } from "../connection";
import { I18nProvider } from "../i18n";
import streamDeckAsDefaultExport, { streamDeck } from "../index";
import { logger } from "../logging";

jest.mock("../logging");
jest.mock("../manifest");
jest.mock("../connection");
jest.mock("../i18n");

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
		const actions = await require("../actions");
		const { devices } = await require("../devices");
		const profiles = await require("../profiles");
		const settings = await require("../settings");
		const system = await require("../system");
		const { ui } = await require("../ui");

		// Act, assert.
		expect(streamDeck.actions).toBe(actions);
		expect(streamDeck.devices).toBe(devices);
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
	 * Asserts supporting enums and classes are exported.
	 */
	it("exports enums and classes", async () => {
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
