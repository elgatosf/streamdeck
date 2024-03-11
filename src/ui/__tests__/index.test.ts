/**
 * @jest-environment jsdom
 */

import streamDeck from "../";
import { actionInfo, registrationInfo } from "../../api/registration/__mocks__";
import { connection } from "../connection";
import * as plugin from "../plugin";
import * as settings from "../settings";
import * as system from "../system";

jest.mock("../connection");

describe("connectElgatoStreamDeckSocket", () => {
	/**
	 * Asserts `connectElgatoStreamDeckSocket` is set on the `window`.
	 */
	it("should exist on the window", () => {
		// Arrange, act, assert.
		expect(window.connectElgatoStreamDeckSocket).not.toBeUndefined();
	});

	/**
	 * Asserts `connectElgatoStreamDeckSocket` sends a connection request to the underlying connection.
	 */
	it("should establish the connection", async () => {
		// Arrange.
		const spyOnConnect = jest.spyOn(connection, "connect");

		// Act.
		await window.connectElgatoStreamDeckSocket("123", "abc123", "registerEvent", JSON.stringify(registrationInfo), JSON.stringify(actionInfo));

		// Assert.
		expect(spyOnConnect).toHaveBeenCalledTimes(1);
		expect(spyOnConnect).toHaveBeenCalledWith<Parameters<(typeof connection)["connect"]>>("123", "abc123", "registerEvent", registrationInfo, actionInfo);
	});
});

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
	 * Asserts {@link streamDeck.onDidConnect} is propagated when the connection emits `connected`.
	 */
	it("receives onDidConnect", () => {
		// Arrange.
		const listener = jest.fn();

		// Act.
		const disposable = streamDeck.onDidConnect(listener);
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
