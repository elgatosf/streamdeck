/**
 * @jest-environment jsdom
 */

import streamDeck from "../";
import { DeviceType } from "../../api";
import { actionInfo, registrationInfo } from "../../api/registration/__mocks__";
import { EventEmitter } from "../../common/event-emitter";
import { LogLevel } from "../../common/logging";
import { connection } from "../connection";
import { plugin } from "../plugin";
import * as settings from "../settings";
import * as system from "../system";

jest.mock("../connection");

describe("streamDeck", () => {
	/**
	 * Asserts the default export contains the required namespaces.
	 */
	it("exports namespaces", () => {
		// Arrange, act, assert.
		expect(streamDeck.plugin).toStrictEqual(plugin);
		expect(streamDeck.settings).toStrictEqual(settings);
		expect(streamDeck.system).toStrictEqual(system);
	});

	/**
	 * Asserts supporting enums, classes, and functions are exported.
	 */
	it("exports enums, classes, and functions", async () => {
		// Arrange.
		const index = (await require("../index")) as typeof import("../index");

		// Act, assert.
		expect(index.DeviceType).toBe(DeviceType);
		expect(index.EventEmitter).toBe(EventEmitter);
		expect(index.LogLevel).toBe(LogLevel);
	});

	/**
	 * Asserts {@link streamDeck.onConnecting} is propagated when the connection emits `connecting`.
	 */
	it("receives onConnecting", () => {
		// Arrange.
		const listener = jest.fn();

		// Act.
		const disposable = streamDeck.onConnecting(listener);
		connection.emit("connecting", registrationInfo, actionInfo);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith(registrationInfo, actionInfo);

		// Act (dispose).
		disposable.dispose();
		connection.emit("connecting", registrationInfo, actionInfo);

		// Assert (dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});

	/**
	 * Asserts {@link streamDeck.onConnected} is propagated when the connection emits `connected`.
	 */
	it("receives onConnected", () => {
		// Arrange.
		const listener = jest.fn();

		// Act.
		const disposable = streamDeck.onConnected(listener);
		connection.emit("connected", registrationInfo, actionInfo);

		// Assert.
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener).toHaveBeenCalledWith(registrationInfo, actionInfo);

		// Act (dispose).
		disposable.dispose();
		connection.emit("connected", registrationInfo, actionInfo);

		// Assert (dispose).
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
